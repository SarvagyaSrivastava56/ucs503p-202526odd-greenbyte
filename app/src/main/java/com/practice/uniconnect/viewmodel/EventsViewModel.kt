// ui/events/viewmodel/EventsViewModel.kt
package com.practice.uniconnect.viewmodel.EventsViewModel

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import com.practice.uniconnect.R
import com.practice.uniconnect.ui.events.Event
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class EventsViewModel : ViewModel() {

    private val allEvents = listOf(
        Event("CCS Hackathon 2025", "Tech Society", "Fri, Aug 29", "10:46 PM", "TAN Building, Room 301", "Tech", R.drawable.hackathon),
        Event("Art Exhibition: Student Showcase", "Arts Collective", "Sun, Aug 31", "12:00 PM", "Main Hall", "Cultural", R.drawable.art_exhibition)
    )

    private val _filteredEvents = MutableStateFlow(allEvents)
    val filteredEvents = _filteredEvents.asStateFlow()

    val selectedCategory = mutableStateOf("All")
    val searchQuery = mutableStateOf("")

    fun updateCategory(category: String) {
        selectedCategory.value = category
        filterEvents()
    }

    fun updateSearch(query: String) {
        searchQuery.value = query
        filterEvents()
    }

    private fun filterEvents() {
        val query = searchQuery.value.lowercase()
        val category = selectedCategory.value

        _filteredEvents.update {
            allEvents.filter {
                (category == "All" || it.category == category) &&
                        (query.isEmpty() || it.title.lowercase().contains(query))
            }
        }
    }
}
