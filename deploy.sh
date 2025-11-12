#!/bin/bash

echo "🚀 Deploying Automation System..."
echo ""

# Make sure we're authenticated
firebase login --no-localhost

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Functions
echo "Deploying Cloud Functions..."
firebase deploy --only functions

echo ""
echo "✅ Done! Refresh your browser to see the changes."
echo "🌐 URL: http://localhost:3000/society-dashboard/automation"


