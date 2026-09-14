class AppException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  const AppException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  const NetworkException([String message = 'Cannot connect to server. Please check your internet connection.'])
      : super(message: message, statusCode: null);
}

class AuthException extends AppException {
  const AuthException([String message = 'Authentication required. Please log in again.'])
      : super(message: message, statusCode: 401);
}

class ServerException extends AppException {
  const ServerException([String message = 'Server error occurred. Please try again later.', int? code])
      : super(message: message, statusCode: code ?? 500);
}

class ValidationException extends AppException {
  const ValidationException(String message, [dynamic details])
      : super(message: message, statusCode: 400, details: details);
}
