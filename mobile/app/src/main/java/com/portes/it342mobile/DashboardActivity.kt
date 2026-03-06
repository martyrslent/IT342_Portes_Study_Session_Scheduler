package com.portes.it342mobile

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class DashboardActivity : AppCompatActivity() {

    private lateinit var tokenManager: TokenManager
    private lateinit var rvSessions: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        val tvWelcome = findViewById<TextView>(R.id.tvWelcome)
        val btnLogout = findViewById<Button>(R.id.btnLogout)
        val btnCreateSession = findViewById<Button>(R.id.btnCreateSession)

        // Initialize RecyclerView
        rvSessions = findViewById(R.id.rvSessions)
        rvSessions.layoutManager = LinearLayoutManager(this)

        tokenManager = TokenManager(this)

        lifecycleScope.launch {
            tokenManager.getToken().collect { token ->
                if (token.isNullOrEmpty()) {
                    startActivity(Intent(this@DashboardActivity, LoginActivity::class.java))
                    finish()
                } else {
                    tvWelcome.text = "Study Sessions"
                    loadSessions()
                }
            }
        }

        // Navigate to Create Session Activity
        btnCreateSession.setOnClickListener {
            val intent = Intent(this, CreateSessionActivity::class.java)
            startActivity(intent)
        }

        btnLogout.setOnClickListener {
            RetrofitClient.instance.logout().enqueue(object : Callback<AuthResponse> {
                override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                    Toast.makeText(this@DashboardActivity, "Logged out", Toast.LENGTH_SHORT).show()
                    lifecycleScope.launch {
                        tokenManager.clearToken()
                        startActivity(Intent(this@DashboardActivity, LoginActivity::class.java))
                        finish()
                    }
                }
                override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                    lifecycleScope.launch {
                        tokenManager.clearToken()
                        startActivity(Intent(this@DashboardActivity, LoginActivity::class.java))
                        finish()
                    }
                }
            })
        }
    }

    // Refresh data when returning to this screen
    override fun onResume() {
        super.onResume()
        loadSessions()
    }

    private fun loadSessions() {
        RetrofitClient.instance.getAllSessions().enqueue(object : Callback<List<StudySession>> {
            override fun onResponse(call: Call<List<StudySession>>, response: Response<List<StudySession>>) {
                if (response.isSuccessful) {
                    val sessions = response.body() ?: emptyList()
                    rvSessions.adapter = SessionAdapter(sessions) //

                    if (sessions.isEmpty()) {
                        Toast.makeText(this@DashboardActivity, "No sessions available", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Log.e("DASHBOARD_ERROR", "Server Error: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<StudySession>>, t: Throwable) {
                Log.e("DASHBOARD_FAILURE", "Connection failed: ${t.message}")
                Toast.makeText(this@DashboardActivity, "Failed to load sessions", Toast.LENGTH_SHORT).show()
            }
        })
    }
}