<?php

/**
 * Plugin_data
 * Data conversion plugin for www.timothymcallister.com
 * @author  Joe Dakroub <joe.dakroub@me.com>
 * @version 1.0
 *
 *
 */

class Plugin_data extends Plugin
{

    const CONTENT_DIR = '_content/';

    const NUMBER_FORMAT = '%s%s/_%02s.%s.md';

    const INDEX = '08';

    public $data = array(
        // 'biography'
        // 'composers',
        // 'compositions',
        // 'conductors',
        'contact'
        // 'ensembles',
        // 'facilities',
        // 'instruments',
        // 'performers',
        // 'producers',
        // 'quote-authors'
        // 'quotes'
    );

    public $meta = array(
        'name'       => 'Data Conversion',
        'version'    => '1.0.0',
        'author'     => 'Joe Dakroub'
    );


    public function index()
    {
        try
        {
            $this->db = new PDO('mysql:host=127.0.0.1;dbname=eh10711a', 'root', 'Butter02Daddy76');
        }
        catch (PDOException $e)
        {
            print "Error!: " . $e->getMessage() . "<br/>";
            die();
        }

        foreach ($this->data as $entity)
        {
            $method = 'create' . ucfirst(str_replace('-', '', $entity));
            $this->$method();
        }

        $this->db = null;
    }

    private function createBiography()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 36 order by exp_weblog_titles.title');

        foreach ($data as $row)
        {
            $biography_parts = explode("\n", str_replace(array('<B>', '</B>', '<I>', '</I>', '&#8217;'), array('**', '**', '*', '*', '\''), $row['field_id_79']));
            $biography = '';

            foreach ($biography_parts as $biography_sentence)
            {
                if ($biography_sentence != '')
                    $biography .= $biography_sentence . "\n\n";
            }

            $biography = trim($biography);

$content = <<<EOD
---
_fieldset: page
title: Biography
---
$biography
EOD;

            $entityDir = sprintf('_content/%s-%s', '01', 'biography');
            $filename = 'page.md';
            $dir = sprintf('%s/%s', $entityDir, $filename);
            file_put_contents($dir, $content);
        }
    }

    private function createComposers()
    {
        $data = $this->db->query('select exp_weblog_titles.title from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 28 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
$content = <<<EOD
---
title: {$row['title']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'composers');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createCompositions()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 13 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
            $composer = Slug::make(preg_replace('/\[\d+\]\s+/', '', $row['field_id_54']));
            $premier = $row['field_id_58'] == 'y' ? 1 : 0;
            $audio_excerpts_array = unserialize($row['field_id_63']);
            $audio_excerpts = '';

            if ($audio_excerpts_array)
            {
                foreach ($audio_excerpts_array as $audio_item)
                {
                    $audio_excerpts .= "\n  -";
                    $audio_excerpts .= "\n    notes: " . $audio_item[1];
                    $audio_excerpts .= "\n    file: '{{ _site_root }}assets/audio/" . $audio_item[2] . "'";
                }
            }

$content = <<<EOD
---
title: '{$row['title']}'
premier: "$premier"
year: {$row['field_id_44']}
composer: /composers/$composer
audio_excerpts: $audio_excerpts
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'compositions');
            $filename = str_replace('\'', '', Slug::make(html_entity_decode(str_replace(array('!', ':', '/', '(', ')', '"', '\'', ',', '.', '?'), '', $row['title']))));

            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createConductors()
    {
        $data = $this->db->query('select exp_weblog_titles.title from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 30 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
$content = <<<EOD
---
title: {$row['title']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'conductors');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createContact()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 41 order by exp_weblog_titles.title');

        foreach ($data as $row)
        {
            $contact_info_parts = unserialize($row['field_id_85']);
            $addresses = '';

            foreach ($contact_info_parts as $contact)
            {
                $addresses .= "\n  -";
                $addresses .= "\n      name: " . $contact[1];
                $addresses .= "\n      organization: " . $contact[2];
                $addresses .= "\n      unit: " . $contact[3];
                $addresses .= "\n      address: " . $contact[4];
                $addresses .= "\n      city: " . $contact[5];
                $addresses .= "\n      state: " . $contact[6];
                $addresses .= "\n      zip_code: " . $contact[7];
                $addresses .= "\n      email: " . $contact[8];
            }

$content = <<<EOD
---
_fieldset: contact
title: Contact
addresses: $addresses
---
EOD;

            $entityDir = sprintf('_content/%s-%s', '06', 'contact');
            $filename = 'page.md';
            $dir = sprintf('%s/%s', $entityDir, $filename);
            file_put_contents($dir, trim($content));
        }
    }

    private function createEnsembles()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 15 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
$content = <<<EOD
---
title: {$row['title']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'ensembles');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createFacilities()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 19 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
$content = <<<EOD
---
title: {$row['title']}
url:
location:
  name:
  latitude: ""
  longitude: ""
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'facilities');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createInstruments()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 29 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
$content = <<<EOD
---
title: {$row['title']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'instruments');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createPerformers()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 14 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
            $instrument = Slug::make(preg_replace('/\[\d+\]\s+/', '', $row['field_id_59']));

            if ($instrument == 'saxophone')
                $instrument = 'saxophones';

$content = <<<EOD
---
title: {$row['title']}
instrument: /instruments/$instrument
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'performers');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createProducers()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 35 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
$content = <<<EOD
---
title: {$row['title']}
url: {$row['field_id_64']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'producers');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createQuoteauthors()
    {
        $data = $this->db->query('select exp_weblog_titles.title from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 31 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
$content = <<<EOD
---
title: {$row['title']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'quote-authors');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createQuotes()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 4 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
            $row['field_id_62'] = preg_replace('/\[\d+\]\s+/', '', $row['field_id_62']);
            $row['field_id_62'] = $row['field_id_62'] != '' ? $row['field_id_62'] : $row['title'];
            $row['title'] = 'Quote ' . $iterator . ' - ' . $row['field_id_62'];
            $slug = Slug::make($row['field_id_62']);

$content = <<<EOD
---
title: {$row['title']}
quote: '{$row['field_id_11']}'
author: /quote-authors/$slug
source: {$row['field_id_13']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'quotes');
            $filename = Slug::make($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }
}
