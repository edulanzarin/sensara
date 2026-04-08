package com.sensara.api.domain.media.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String upload(MultipartFile file);

    void delete(String fileUrl);
}