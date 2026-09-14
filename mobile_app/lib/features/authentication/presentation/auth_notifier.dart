import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/storage/token_storage.dart';
import '../data/auth_repository.dart';
import '../models/user_model.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage();
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(tokenStorageProvider);
  return ApiClient(
    tokenStorage: storage,
    onTokenExpired: () async {
      await storage.clearAll();
    },
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

class AuthStateNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthRepository _repository;
  final TokenStorage _tokenStorage;

  AuthStateNotifier(this._repository, this._tokenStorage)
      : super(const AsyncValue.loading()) {
    checkSession();
  }

  Future<void> checkSession() async {
    try {
      state = const AsyncValue.loading();
      final user = await _repository.getMe();
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repository.login(email: email, password: password);
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String professionalStatus,
    required String collegeName,
    String? companyName,
    String? currentRole,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repository.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
        professionalStatus: professionalStatus,
        collegeName: collegeName,
        companyName: companyName,
        currentRole: currentRole,
      );
      state = AsyncValue.data(user);
      return user;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AsyncValue.data(null);
  }

  Future<bool> isFirstTime() async {
    return await _tokenStorage.isFirstTimeUser();
  }

  Future<void> completeOnboarding() async {
    await _tokenStorage.setFirstTimeUser(false);
  }

  void updateSubscription({required bool isSubscribed, String? plan, String? expiry}) {
    final current = state.asData?.value;
    if (current != null) {
      final updated = current.copyWith(
        isSubscribed: isSubscribed,
        subscriptionPlan: plan ?? (isSubscribed ? 'Pro Candidate' : null),
        subscriptionExpiry: expiry ?? (isSubscribed ? 'Sep 13, 2027' : null),
      );
      state = AsyncValue.data(updated);
    }
  }
}

final authNotifierProvider =
    StateNotifierProvider<AuthStateNotifier, AsyncValue<UserModel?>>((ref) {
  return AuthStateNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(tokenStorageProvider),
  );
});
