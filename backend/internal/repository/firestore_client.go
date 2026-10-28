package repository

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
)

// FirestoreClient wraps the Google Cloud Firestore client.
type FirestoreClient struct {
	Client     *firestore.Client
	ProjectID  string
	DatabaseID string
}

// NewFirestoreClient initializes a live connection to Google Cloud Firestore for the given GCP project ID and optional database ID.
func NewFirestoreClient(ctx context.Context, gcpProjectID string, databaseID ...string) (*FirestoreClient, error) {
	if gcpProjectID == "" {
		return nil, fmt.Errorf("GOOGLE_CLOUD_PROJECT is required to initialize Firestore client")
	}

	dbID := "(default)"
	if len(databaseID) > 0 && databaseID[0] != "" {
		dbID = databaseID[0]
	}

	var (
		client *firestore.Client
		err    error
	)
	if dbID == "" || dbID == "(default)" {
		client, err = firestore.NewClient(ctx, gcpProjectID)
	} else {
		client, err = firestore.NewClientWithDatabase(ctx, gcpProjectID, dbID)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to create firestore client: %w", err)
	}

	return &FirestoreClient{
		Client:     client,
		ProjectID:  gcpProjectID,
		DatabaseID: dbID,
	}, nil
}

// Close closes the underlying Firestore client connection.
func (fc *FirestoreClient) Close() error {
	if fc.Client != nil {
		return fc.Client.Close()
	}
	return nil
}

// Projects returns the top-level "projects" collection reference.
func (fc *FirestoreClient) Projects() *firestore.CollectionRef {
	return fc.Client.Collection("projects")
}

// ProjectDoc returns the document reference for a specific project.
func (fc *FirestoreClient) ProjectDoc(projectID string) *firestore.DocumentRef {
	return fc.Projects().Doc(projectID)
}
