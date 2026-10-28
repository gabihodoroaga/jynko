package model

import "time"

// PageCollection represents a logical grouping container for wiki pages.
type PageCollection struct {
	ID          string    `firestore:"id" json:"id"`
	ProjectID   string    `firestore:"project_id" json:"project_id"`
	Name        string    `firestore:"name" json:"name"`
	Description string    `firestore:"description" json:"description"`
	CreatedAt   time.Time `firestore:"created_at" json:"created_at"`
	UpdatedAt   time.Time `firestore:"updated_at" json:"updated_at"`
}

// Page represents a documentation document in the Wiki system.
// Visibility and edit permissions follow the parent Project's RBAC roles.
type Page struct {
	ID           string    `firestore:"id" json:"id"`
	ProjectID    string    `firestore:"project_id" json:"project_id"`
	CollectionID string    `firestore:"collection_id,omitempty" json:"collection_id,omitempty"`
	ParentPageID string    `firestore:"parent_page_id,omitempty" json:"parent_page_id,omitempty"` // For nested page tree
	Title        string    `firestore:"title" json:"title"`
	Content      string    `firestore:"content" json:"content"` // Markdown block content
	Order        int       `firestore:"order" json:"order"`     // Sort order within sibling pages
	IsLocked     bool      `firestore:"is_locked" json:"is_locked"`
	LabelIDs     []string  `firestore:"label_ids" json:"label_ids"`
	CreatedBy    string    `firestore:"created_by" json:"created_by"`
	UpdatedBy    string    `firestore:"updated_by" json:"updated_by"`
	CreatedAt    time.Time `firestore:"created_at" json:"created_at"`
	UpdatedAt    time.Time `firestore:"updated_at" json:"updated_at"`
}

// PageVersion represents an immutable historical revision of a Page.
type PageVersion struct {
	ID        string    `firestore:"id" json:"id"`
	PageID    string    `firestore:"page_id" json:"page_id"`
	Title     string    `firestore:"title" json:"title"`
	Content   string    `firestore:"content" json:"content"`
	CreatedBy string    `firestore:"created_by" json:"created_by"`
	CreatedAt time.Time `firestore:"created_at" json:"created_at"`
}
