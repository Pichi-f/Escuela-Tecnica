<?php
/**
 * Plugin Name: Escuela Técnica Courses Feed
 * Description: Exposes a REST endpoint for the courses feed and caches the normalized payload.
 * Version: 0.1.0
 * Author: Copilot
 */

if (!defined('ABSPATH')) {
    exit;
}

define('ESCUELA_TECNICA_COURSES_FEED_PATH', plugin_dir_path(__FILE__));
define('ESCUELA_TECNICA_COURSES_FEED_URL', plugin_dir_url(__FILE__));

require_once ESCUELA_TECNICA_COURSES_FEED_PATH . 'includes/class-escuela-tecnica-courses-feed.php';
require_once ESCUELA_TECNICA_COURSES_FEED_PATH . 'includes/class-escuela-tecnica-courses-rest-controller.php';

add_action('plugins_loaded', static function () {
    $feed = new Escuela_Tecnica_Courses_Feed();
    $controller = new Escuela_Tecnica_Courses_Rest_Controller($feed);
    $controller->register_routes();
});
