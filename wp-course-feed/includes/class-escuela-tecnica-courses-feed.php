<?php

if (!defined('ABSPATH')) {
    exit;
}

class Escuela_Tecnica_Courses_Feed {
    private const OPTION_SOURCE_URL = 'escuela_tecnica_courses_source_url';
    private const TRANSIENT_CACHE_KEY = 'escuela_tecnica_courses_feed_cache';
    private const CACHE_TTL = 15 * MINUTE_IN_SECONDS;

    public function get_courses(): array {
        $cached = get_transient(self::TRANSIENT_CACHE_KEY);
        if (is_array($cached)) {
            return $cached;
        }

        $source_url = trim((string) get_option(self::OPTION_SOURCE_URL, ''));
        if ($source_url === '') {
            return $this->default_payload();
        }

        $response = wp_remote_get($source_url, [
            'timeout' => 20,
            'headers' => [
                'Accept' => 'application/json',
            ],
        ]);

        if (is_wp_error($response)) {
            return $this->default_payload();
        }

        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code < 200 || $status_code >= 300) {
            return $this->default_payload();
        }

        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        $courses = $this->extract_courses($decoded);

        if (empty($courses)) {
            $courses = $this->default_payload();
        }

        set_transient(self::TRANSIENT_CACHE_KEY, $courses, self::CACHE_TTL);

        return $courses;
    }

    public function clear_cache(): void {
        delete_transient(self::TRANSIENT_CACHE_KEY);
    }

    public function set_source_url(string $source_url): void {
        update_option(self::OPTION_SOURCE_URL, esc_url_raw($source_url), false);
        $this->clear_cache();
    }

    private function extract_courses($decoded): array {
        if (is_array($decoded) && isset($decoded['courses']) && is_array($decoded['courses'])) {
            return $decoded['courses'];
        }

        if (is_array($decoded) && isset($decoded['items']) && is_array($decoded['items'])) {
            return $decoded['items'];
        }

        if (is_array($decoded) && $this->is_list_array($decoded)) {
            return $decoded;
        }

        return [];
    }

    private function is_list_array(array $value): bool {
        if (empty($value)) {
            return true;
        }

        return array_keys($value) === range(0, count($value) - 1);
    }

    private function default_payload(): array {
        return [
            [
                'no' => 1,
                'code' => '197',
                'name' => 'Propiedad Intelectual',
                'teacher' => 'Licda. Ligia Eunice Vásquez Dardón',
                'startTime' => '12:00',
                'endTime' => '14:00',
                'days' => ['Ma', 'Mi'],
                'startDate' => 'lunes 19 de enero',
                'creditsUsac' => 2,
                'creditsClar' => 2,
                'classLink' => '',
                'imageClass' => 'img-construccion',
                'icon' => '<path d="M2 20h20M6 20V10m12 10V10M2 10l10-7 10 7"/>'
            ],
        ];
    }
}
