package com.portes.it342mobile

import retrofit2.http.GET
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

// Updated to match your User.java backend model
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val username: String, // Changed from 'name' to 'username' to match User.java
    val email: String,    // Matches User.java email field
    val password: String  // Matches User.java password field
)

data class AuthResponse(
    val status: String,
    val message: String,
    val token: String?
)

interface ApiService {
    @POST("api/sessions")
    fun createSession(@Body session: StudySession): Call<StudySession>

    @GET("api/sessions")
    fun getAllSessions(): Call<List<StudySession>>
    // Removed leading slash; combines with RetrofitClient BASE_URL
    // Matches @RequestMapping("/api") + @PostMapping("/auth/login")
    @POST("api/auth/login")
    fun login(@Body request: LoginRequest): Call<AuthResponse>

    // Removed leading slash; combines with RetrofitClient BASE_URL
    // Matches @RequestMapping("/api") + @PostMapping("/auth/register")
    @POST("api/auth/register")
    fun register(@Body request: RegisterRequest): Call<AuthResponse>

    // Note: Your AuthController.java currently lacks a logout endpoint
    @POST("api/auth/logout")
    fun logout(): Call<AuthResponse>
}