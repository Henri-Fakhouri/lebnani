package com.henri.lebnani.content;

import com.henri.lebnani.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentImportControllerTest {

    @Mock ContentImportService contentImportService;
    @InjectMocks ContentImportController controller;

    @Test
    void importContent_delegates_to_service_without_replace_mode() {
        ContentImportRequest request = mock(ContentImportRequest.class);
        User user = mock(User.class);
        ContentImportResponse response = new ContentImportResponse(
                1L,
                2L,
                new ContentImportResponse.ImportCounts(0, 0, 0, 0, 0, 0)
        );

        when(contentImportService.importContent(2L, request, user, false)).thenReturn(response);

        ContentImportResponse result = controller.importContent(2L, request, user, false);

        assertThat(result).isEqualTo(response);
        verify(contentImportService).importContent(2L, request, user, false);
    }

    @Test
    void importContent_delegates_to_service_with_replace_mode() {
        ContentImportRequest request = mock(ContentImportRequest.class);
        User user = mock(User.class);
        ContentImportResponse response = new ContentImportResponse(
                1L,
                2L,
                new ContentImportResponse.ImportCounts(0, 0, 0, 0, 0, 0)
        );

        when(contentImportService.importContent(2L, request, user, true)).thenReturn(response);

        ContentImportResponse result = controller.importContent(2L, request, user, true);

        assertThat(result).isEqualTo(response);
        verify(contentImportService).importContent(2L, request, user, true);
    }

    @Test
    void getImportRuns_delegates_to_service() {
        User user = mock(User.class);
        List<ContentImportRunResponse> responses = List.of();

        when(contentImportService.getImportRuns(2L, user)).thenReturn(responses);

        List<ContentImportRunResponse> result = controller.getImportRuns(2L, user);

        assertThat(result).isEqualTo(responses);
        verify(contentImportService).getImportRuns(2L, user);
    }
}