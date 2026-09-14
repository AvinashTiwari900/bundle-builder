import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static const _tokenKey = 'ras_jwt_token';
  static const _userIdKey = 'ras_user_id';
  static const _userEmailKey = 'ras_user_email';
  static const _firstTimeUserKey = 'ras_is_first_time';

  final FlutterSecureStorage _storage;

  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<void> saveUserInfo({required String id, required String email}) async {
    await _storage.write(key: _userIdKey, value: id);
    await _storage.write(key: _userEmailKey, value: email);
  }

  Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }

  Future<String?> getUserEmail() async {
    return await _storage.read(key: _userEmailKey);
  }

  Future<void> setFirstTimeUser(bool isFirstTime) async {
    await _storage.write(key: _firstTimeUserKey, value: isFirstTime ? 'true' : 'false');
  }

  Future<bool> isFirstTimeUser() async {
    final value = await _storage.read(key: _firstTimeUserKey);
    return value == 'true';
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
