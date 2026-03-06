package com.portes.it342mobile

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CreateSessionActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_session)

        val etTopic = findViewById<TextInputEditText>(R.id.etTopic)
        val etLocation = findViewById<TextInputEditText>(R.id.etLocation)
        val etDate = findViewById<TextInputEditText>(R.id.etDate)
        val etTime = findViewById<TextInputEditText>(R.id.etTime)
        val etMax = findViewById<TextInputEditText>(R.id.etMaxParticipants)
        val btnSubmit = findViewById<MaterialButton>(R.id.btnSubmitSession)

        btnSubmit.setOnClickListener {
            val session = StudySession(
                topic = etTopic.text.toString(),
                location = etLocation.text.toString(),
                date = etDate.text.toString(),
                time = etTime.text.toString(),
                maxParticipants = etMax.text.toString().toIntOrNull() ?: 5
            )

            RetrofitClient.instance.createSession(session).enqueue(object : Callback<StudySession> {
                override fun onResponse(call: Call<StudySession>, response: Response<StudySession>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@CreateSessionActivity, "Session Created!", Toast.LENGTH_SHORT).show()
                        finish() // Go back to Dashboard
                    }
                }

                override fun onFailure(call: Call<StudySession>, t: Throwable) {
                    Toast.makeText(this@CreateSessionActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }
}