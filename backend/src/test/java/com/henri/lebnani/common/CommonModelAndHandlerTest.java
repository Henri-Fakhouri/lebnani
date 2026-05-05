package com.henri.lebnani.common;

import com.henri.lebnani.content.ContentValidationError;
import com.henri.lebnani.content.ContentValidationErrorResponse;
import com.henri.lebnani.content.ContentValidationException;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CommonModelAndHandlerTest {

    @Test
    void businessException_exposes_code_and_message() {
        BusinessException exception = new BusinessException("CODE", "Message");

        assertThat(exception.getCode()).isEqualTo("CODE");
        assertThat(exception).hasMessage("Message");
    }

    @Test
    void errorResponse_exposes_fields() {
        ErrorResponse response = new ErrorResponse("CODE", "Message");

        assertThat(response.getCode()).isEqualTo("CODE");
        assertThat(response.getMessage()).isEqualTo("Message");
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    void handleBusinessException_returns_error_response() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ErrorResponse response = handler.handleBusinessException(
                new BusinessException("BUSINESS_ERROR", "Business message")
        );

        assertThat(response.getCode()).isEqualTo("BUSINESS_ERROR");
        assertThat(response.getMessage()).isEqualTo("Business message");
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    void handleContentValidationException_returns_content_validation_response() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        ContentValidationError error = new ContentValidationError("units[0]", "Bad unit");

        ContentValidationErrorResponse response = handler.handleContentValidationException(
                new ContentValidationException(List.of(error))
        );

        assertThat(response.getCode()).isEqualTo("CONTENT_VALIDATION_ERROR");
        assertThat(response.getMessage()).isEqualTo("Content import validation failed.");
        assertThat(response.getErrors()).containsExactly(error);
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    @SuppressWarnings("null")
    void handleValidationException_uses_first_field_error() throws Exception {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "email", "must not be blank"));

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(
                methodParameter(),
                bindingResult
        );

        ErrorResponse response = handler.handleValidationException(exception);

        assertThat(response.getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getMessage()).isEqualTo("email: must not be blank");
        assertThat(response.getTimestamp()).isNotNull();
    }

    @Test
    @SuppressWarnings("null")
    void handleValidationException_uses_default_message_when_no_field_error() throws Exception {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(
                methodParameter(),
                bindingResult
        );

        ErrorResponse response = handler.handleValidationException(exception);

        assertThat(response.getCode()).isEqualTo("VALIDATION_ERROR");
        assertThat(response.getMessage()).isEqualTo("Invalid request.");
        assertThat(response.getTimestamp()).isNotNull();
    }

    @SuppressWarnings("null")
    private MethodParameter methodParameter() throws NoSuchMethodException {
        Method method = CommonModelAndHandlerTest.class.getDeclaredMethod("dummyMethod", Object.class);
        return new MethodParameter(method, 0);
    }

    @SuppressWarnings("unused")
    private void dummyMethod(Object request) {
        // used only to build MethodParameter
    }
}