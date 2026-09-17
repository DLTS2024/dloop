<?php
// Copy this file to db_config.php on the server. Never commit db_config.php.
const DB_HOST = 'localhost';
const DB_NAME = 'dloopsto_store';
const DB_USER = 'dloopsto_syncapi';
const DB_PASS = 'replace-with-your-database-password';

// Must match the password used to sign in to admin.html.
const ADMIN_SYNC_PASSWORD = 'change-this-admin-password';

function dloop_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    return $pdo;
}
