package com.sensara.api.domain.media.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${storage.upload-dir:uploads}")
    private String uploadDir;

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path targetPath = uploadPath.resolve(filename);

            file.transferTo(targetPath);

            // Retorna a URL relativa — em produção troca por URL do S3/R2
            return "/uploads/" + filename;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }
    }

    public void delete(String fileUrl) {
        try {
            String filename = fileUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Loga mas não explode — arquivo pode já ter sido deletado
            System.err.println("Failed to delete file: " + fileUrl);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains("."))
            return ".jpg";
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }
}