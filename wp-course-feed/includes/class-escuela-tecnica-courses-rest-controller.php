<?php

if (!defined('ABSPATH')) {
    exit;
}

class Escuela_Tecnica_Courses_Rest_Controller {
    private $feed;

    public function __construct(Escuela_Tecnica_Courses_Feed $feed) {
        $this->feed = $feed;
    }

    public function register_routes(): void {
        add_action('rest_api_init', function () {
            register_rest_route('escuela-tecnica/v1', '/cursos', [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'handle_get_courses'],
                'permission_callback' => '__return_true',
            ]);
        });
    }

    public function handle_get_courses(WP_REST_Request $request): WP_REST_Response {
        return rest_ensure_response([
            'updatedAt' => gmdate('c'),
            'courses' => $this->feed->get_courses(),
        ]);
    }
}
