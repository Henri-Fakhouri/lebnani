package com.henri.lebnani.content;

import com.henri.lebnani.user.User;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class ContentImportController {

    private final ContentImportService contentImportService;

    public ContentImportController(ContentImportService contentImportService) {
        this.contentImportService = contentImportService;
    }

    @PostMapping("/courses/{courseId}/content/import")
    public ContentImportResponse importContent(
            @PathVariable Long courseId,
            @Valid @RequestBody ContentImportRequest request,
            @AuthenticationPrincipal User user
    ) {
        return contentImportService.importContent(courseId, request, user);
    }
}