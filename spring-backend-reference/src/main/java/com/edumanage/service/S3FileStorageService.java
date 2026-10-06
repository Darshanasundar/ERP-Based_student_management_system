package com.edumanage.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3FileStorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.s3.region}")
    private String region;

    /**
     * Uploads a file to the configured S3 bucket and returns its public URL.
     */
    public String uploadFile(MultipartFile file, String folderName) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "unknown.file";
        }
        
        String fileExtension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFilename.substring(i);
        }
        
        // Generate a unique file name
        String fileName = folderName + "/" + UUID.randomUUID().toString() + fileExtension;

        // Determine content type (MIME type)
        String contentType = file.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                    // If your bucket enforces ACLs, you could add .acl(ObjectCannedACL.PUBLIC_READ)
                    // But modern best practice uses Bucket Policies for public folders instead.
                    .build();

            s3Client.putObject(putOb, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File successfully uploaded to S3: {}", fileName);

            // Construct and return the public URL
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
            
        } catch (S3Exception | IOException e) {
            log.error("Failed to upload file to S3", e);
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage());
        }
    }

    /**
     * Deletes a file from the S3 bucket using its public URL or Key.
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        
        try {
            // Extract key from URL. Example URL: https://my-bucket.s3.us-east-1.amazonaws.com/profiles/123.jpg
            String key = extractKeyFromUrl(fileUrl);
            
            DeleteObjectRequest deleteObj = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
                    
            s3Client.deleteObject(deleteObj);
            log.info("Successfully deleted file from S3: {}", key);
        } catch (Exception e) {
            log.error("Failed to delete file from S3. URL: {}", fileUrl, e);
            // Non-blocking error, we don't throw to avoid failing the main transaction
        }
    }
    
    private String extractKeyFromUrl(String fileUrl) {
        // Simple extraction based on standard AWS S3 domain
        String s3Domain = ".amazonaws.com/";
        int index = fileUrl.indexOf(s3Domain);
        if (index > -1) {
            return fileUrl.substring(index + s3Domain.length());
        }
        return fileUrl; // Fallback in case just the key was passed
    }
}
