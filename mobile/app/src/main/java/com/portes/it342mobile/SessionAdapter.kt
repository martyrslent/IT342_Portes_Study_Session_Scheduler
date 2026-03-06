package com.portes.it342mobile

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class SessionAdapter(private val sessions: List<StudySession>) :
    RecyclerView.Adapter<SessionAdapter.SessionViewHolder>() {

    class SessionViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvTopic: TextView = view.findViewById(R.id.tvTopicBadge)
        val tvLocation: TextView = view.findViewById(R.id.tvLocation)
        val tvDateTime: TextView = view.findViewById(R.id.tvDateTime)
        val tvCapacity: TextView = view.findViewById(R.id.tvCapacity)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SessionViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_session, parent, false) // Using your new card design
        return SessionViewHolder(view)
    }

    override fun onBindViewHolder(holder: SessionViewHolder, position: Int) {
        val session = sessions[position]
        holder.tvTopic.text = session.topic.uppercase()
        holder.tvLocation.text = session.location
        holder.tvDateTime.text = "${session.date} @ ${session.time}"
        holder.tvCapacity.text = "Spots: ${session.currentParticipants}/${session.maxParticipants}"
    }

    override fun getItemCount() = sessions.size
}