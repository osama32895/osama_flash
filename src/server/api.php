<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// --- Configuration ---

// Define the storage directory: root/material/
// __DIR__ is src/server, so we go up two levels to reach the project root.
$materialDir = __DIR__ . '/../../material';

// Ensure the material directory exists
if (!is_dir($materialDir)) {
    mkdir($materialDir, 0777, true);
}

// File paths for Flat-File Database
$files = [
    'items'  => $materialDir . '/items.txt',
    'config' => $materialDir . '/config.txt',
    'stats'  => $materialDir . '/stats.txt'
];

// --- Default Data ---
// "do not make the api.php have a default items"
// We start with empty structures. The file is the source of truth.
$defaults = [
    'items' => [], // Empty by default. Admin must add apps.
    'config' => [
        'adminPass' => '', // No default password. Admin must set one or use empty.
        'siteTitle' => 'Osama Flash',
        'aboutContent' => '<h1 class="text-3xl font-bold text-white mb-2">About Osama</h1><p class="text-gray-300">Welcome to the official file repository.</p>'
    ],
    'stats' => [
        'visitors' => 0,
        'totalDownloads' => 0
    ]
];

// --- Helper Functions ---

function getDB($key) {
    global $files, $defaults;
    $file = $files[$key];
    
    // If file exists, read it.
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        // If JSON is valid, return it.
        if (is_array($data)) {
            return $data;
        }
    }
    
    // If file is missing or corrupt, initialize with empty/default structure and save it.
    saveDB($key, $defaults[$key]);
    return $defaults[$key];
}

function saveDB($key, $data) {
    global $files;
    // Save as pretty-printed JSON for readability in the text file
    file_put_contents($files[$key], json_encode($data, JSON_PRETTY_PRINT));
}

// --- Request Handling ---

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch($action) {
        case 'get_all':
            // Returns the content of the text files
            echo json_encode([
                'items' => getDB('items'),
                'stats' => getDB('stats'),
                'config' => getDB('config')
            ]);
            break;

        case 'add_item':
            // 1. Read current items from items.txt
            $items = getDB('items');
            
            // 2. Create new item object
            $newItem = [
                'id' => time(), // Unique ID
                'name' => $input['name'],
                'type' => $input['type'],
                'icon' => $input['icon'],
                'rating' => 0,
                'ratingCount' => 0,
                'downloads' => 0,
                'releaseDate' => $input['releaseDate'],
                'description' => $input['description'],
                'url' => $input['url'],
                'likes' => 0,
                'dislikes' => 0
            ];
            
            // 3. Add to top of list
            array_unshift($items, $newItem);
            
            // 4. Save back to items.txt
            saveDB('items', $items);
            
            echo json_encode(['success' => true, 'id' => $newItem['id']]);
            break;

        case 'update_item':
            $items = getDB('items');
            $updated = false;
            foreach ($items as &$item) {
                if ($item['id'] == $input['id']) {
                    $item = array_merge($item, $input);
                    $updated = true;
                    break;
                }
            }
            if ($updated) saveDB('items', $items);
            echo json_encode(['success' => $updated]);
            break;

        case 'delete_item':
            $items = getDB('items');
            $filtered = array_values(array_filter($items, function($i) use ($input) {
                return $i['id'] != $input['id'];
            }));
            saveDB('items', $filtered);
            echo json_encode(['success' => true]);
            break;

        case 'increment_download':
            // Update items.txt
            $items = getDB('items');
            foreach ($items as &$item) {
                if ($item['id'] == $input['id']) {
                    $item['downloads']++;
                    break;
                }
            }
            saveDB('items', $items);
            
            // Update stats.txt
            $stats = getDB('stats');
            $stats['totalDownloads']++;
            saveDB('stats', $stats);
            
            echo json_encode(['success' => true]);
            break;

        case 'increment_visitor':
            // Update stats.txt
            $stats = getDB('stats');
            $stats['visitors']++;
            saveDB('stats', $stats);
            echo json_encode(['success' => true]);
            break;

        case 'login':
            // Read password from config.txt
            $config = getDB('config');
            if ($config['adminPass'] === $input['password']) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false]);
            }
            break;

        case 'update_config':
            // Update config.txt (Password, Title, About Content)
            $config = getDB('config');
            if (isset($input['adminPass'])) $config['adminPass'] = $input['adminPass'];
            if (isset($input['siteTitle'])) $config['siteTitle'] = $input['siteTitle'];
            if (isset($input['aboutContent'])) $config['aboutContent'] = $input['aboutContent'];
            saveDB('config', $config);
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['error' => 'Invalid Action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>