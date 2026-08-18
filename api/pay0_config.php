<?php
/**
 * D Loop 3D — Pay0 Gateway Configuration
 * https://pay0.shop/docs
 */

// Allow CORS from allowed frontend origins
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Credentials
define('PAY0_API_KEY', 'c93aae94c854cbdee78c40acefb5bdc2');
define('PAY0_SECRET', 'IhVZmJ4Kte200064108');
define('PAY0_BASE_URL', 'https://pay0.shop/api');
