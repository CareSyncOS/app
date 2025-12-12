<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// In a real app, this might come from a DB or config file.
// For now, we define the roadmap here.

$response = [
    'status' => 'success',
    'data' => [
        'current' => [
            'version' => '1.0.0',
            'developer' => 'Sumit Srivastava',
            'description' => 'A comprehensive clinic management solution designed for efficiency and ease of use.',
            'features' => [
                ['title' => 'Dashboard', 'desc' => 'Real-time clinic overview & stats'],
                ['title' => 'Inquiry', 'desc' => 'Lead management & follow-ups'],
                ['title' => 'Registration', 'desc' => 'New patient onboarding'],
                ['title' => 'Appointments', 'desc' => 'Scheduling & visit tracking'],
                ['title' => 'Patients', 'desc' => 'Medical records & history'],
                ['title' => 'Billing', 'desc' => 'Invoicing & payment processing'],
                ['title' => 'Expenses', 'desc' => 'Budget tracking & expense management'],
                ['title' => 'Support', 'desc' => 'Help center & issue reporting'],
            ]
        ],
        'upcoming' => [
            'version' => '1.1.0',
            'release_date' => 'December 2025',
            'headline' => 'Performance & Offline Mode',
            'features' => [
                'Complete Offline Support (Work without internet)',
                'Faster Dashboard Loading Times',
                'Advanced Reporting Filters',
                'Patient Portal Integration',
                'Cloud Backup Sync'
            ]
        ]
    ]
];

echo json_encode($response);
