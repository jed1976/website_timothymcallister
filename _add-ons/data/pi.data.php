<?php

/**
 * DB_Cache Class
 * This dummy class is needed to extract some 'rel' data types from ExpressionEngine
 * @author  Joe Dakroub <joe.dakroub@me.com>
 * @version 1.0
 */
class DB_Cache
{
    function __constructor()
    {
        return $this;
    }
}

/**
 * Plugin_data
 * Data conversion plugin for www.timothymcallister.com
 * @author  Joe Dakroub <joe.dakroub@me.com>
 * @version 1.0
 */

class Plugin_data extends Plugin
{

    const CONTENT_DIR = '_content/';

    const NUMBER_FORMAT = '%s%s/_%02s.%s.md';

    const VISIBLE_NUMBER_FORMAT = '%s%s/%02s.%s.md';

    const INDEX = '08';

    const REGEX_BRACKET = '/\[\d+\]\s+/';

    const DATE_OFFSET = '-5 hours';

    public $invalidCharacters = array('!', ':', '/', '(', ')', '"', '\'', ',', '.', '?', ';');

    public $invalidHTML = array('**', '<B>', '</B>', '<I>', '</I>', '&#8217;');

    public $markdownReplacements = array('', '**', '**', '*', '*', '\'');



    public $data = array(
        'biography',
        // 'composers',
        // 'compositions',
        // 'conductors',
        // 'contact',
        // 'ensembles',
        // 'facilities',
        // 'instruments',
        // 'performers',
        // 'producers',
        // 'quote-authors',
        // 'quotes',
        // 'recordings',
        //'schedule'
    );

    public $meta = array(
        'name'       => 'Data Conversion',
        'version'    => '1.0.0',
        'author'     => 'Joe Dakroub'
    );

    public $skipFiles = array('fields.yaml', 'page.md');


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

    private function emptyDirectory($directory)
    {
        // $files = scandir($directory);

        // foreach ($files as $file)
        // {
        //     if (!in_array($file, $this->skipFiles) && is_file($directory.'/'.$file))
        //         unlink($directory.'/'.$file);
        // }
    }

    private function removeBrackets($string)
    {
        return preg_replace(self::REGEX_BRACKET, '', $string);
    }

    private function createSlug($string)
    {
        // Special cases
        switch ($string)
        {
            case "Alexander Glazunov\rTimothy McAllister":
                $string = 'Alexander Glazunov';
                break;

            case 'ChiaYu Hsu':
                $string = 'Chia-Yu Hsu';
                break;

            case 'Emiliano Pardo-Tristan':
                $string = 'Emiliano Pardo-Tristan';
                break;

            case 'Gabriel Piern233':
                $string = 'Gabriel Pierne';
                break;

            case 'G233rard Grisey':
                $string = 'Gerard Grisey';
                break;

            case 'Heitor VillaLobos':
                $string = 'Heitor Villa-Lobos';
                break;

            case "Johannes Brahms\rPeter Saiano":
                $string = 'Johannes Brahms';
                break;

            case 'MingHsiu Yen':
                $string = 'Ming-Hsiu Yen';
                break;

            case "Modest Mussorgsky\rMaurice Ravel":
                $string = 'Modest Mussorgsky';
                break;

            case "Robert Schumann\rFred Hemke":
                $string = 'Robert Schumann';
                break;
        }

        return Slug::make(str_replace($this->invalidCharacters, '', html_entity_decode($string)));
    }

    private function createBiography()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 36 order by exp_weblog_titles.title');

        foreach ($data as $row)
        {
            $biography_parts = explode("\n", str_replace($this->invalidHTML, $this->markdownReplacements, $row['field_id_79']));
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
            $this->emptyDirectory($entityDir);
            file_put_contents($dir, $content);
        }
    }

    private function createComposers()
    {
        $data = $this->db->query('select exp_weblog_titles.title from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 28 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
            $title = html_entity_decode($row['title']);
$content = <<<EOD
---
title: $title
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'composers');
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
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
            $composer = $this->removeBrackets($row['field_id_54']);

            // Special cases
            switch ($row['title'])
            {
                case 'Crossroads Songs':
                case 'Fire Hose Reel':
                    $composer = 'Evan Chambers';
                    break;

                case 'Ludus No. 2':
                    $composer = 'Emiliano Pardo-Tristan';
                    break;
            }

            $composer = $this->createSlug($composer);
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
            $filename = $this->createSlug($row['title']);

            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
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
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
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
            $this->emptyDirectory($entityDir);
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
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
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
title: '{$row['title']}'
url:
location:
  name:
  latitude: ""
  longitude: ""
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'facilities');
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
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
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
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
            $instrument = $this->createSlug($this->removeBrackets($row['field_id_59']));

            if ($instrument == 'saxophone')
                $instrument = 'saxophones';

$content = <<<EOD
---
title: {$row['title']}
instrument: /instruments/$instrument
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'performers');
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
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
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createQuoteauthors()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 4 order by exp_weblog_titles.title');
        $iterator = 1;
        $authors = array();

        foreach ($data as $row)
        {
                $title = $row['title'];
                $author_field = $this->removeBrackets($row['field_id_62']);

                if ($author_field)
                {
                    $title = $author_field;

                    if ($title == 'JeanMarie Londeix')
                        $title = 'Jean-Marie Londeix';
                }

                $authors[] = $title;
        }

        $authors = array_unique($authors);
        sort($authors);

        foreach ($authors as $author)
        {
$content = <<<EOD
---
title: $author
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'quote-authors');
            $filename = $this->createSlug($author);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createQuotes()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 4 order by exp_weblog_titles.title');
        $iterator = 1;
        $quotes = array();

        foreach ($data as $row)
        {
            $row['field_id_62'] = $this->removeBrackets($row['field_id_62']);

            if ($row['field_id_62'] == 'JeanMarie Londeix')
                $row['field_id_62'] = 'Jean-Marie Londeix';

            $row['field_id_62'] = $row['field_id_62'] != '' ? $row['field_id_62'] : $row['title'];
            $row['title'] = $row['field_id_62'] . ' - ' . $row['entry_id'];
            $slug = $this->createSlug($row['field_id_62']);

            $quotes[] = array(
                'name' => $row['field_id_62'],
                'title' => $row['title'],
                'quote' => $row['field_id_11'],
                'author' => '/quote-authors/' . $slug,
                'source' => $row['field_id_13']
            );
        }

        function cmp($a, $b)
        {
            if ($a['name'] == $b['name'])
                return 0;

            return ($a['name'] < $b['name']) ? -1 : 1;
        }

        usort($quotes, 'cmp');

        foreach ($quotes as $quote)
        {
$content = <<<EOD
---
title: {$quote['title']}
quote: '{$quote['quote']}'
author: {$quote['author']}
source: {$quote['source']}
---

EOD;


            $entityDir = sprintf('_%s-%s', self::INDEX, 'quotes');
            $filename = $this->createSlug($quote['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            $this->emptyDirectory($entityDir);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createRecordings()
    {
        ini_set('unserialize_callback_func', 'test');

        function test($className)
        {
            new $className();
        }

        $data = $this->db->query('select exp_weblog_titles.title, exp_relationships.rel_data as producer, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_data.entry_id = exp_weblog_titles.entry_id left join exp_relationships on exp_weblog_data.field_id_66 = exp_relationships.rel_id where exp_weblog_data.weblog_id = 33 order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
            $title = $this->createSlug($row['title']);
            $row['field_id_65'] = strtotime(self::DATE_OFFSET, $row['field_id_65']);
            $release_date = $row['field_id_65'] != 0 ? date('Y-m-d', $row['field_id_65']) : '';
            $tribute = $row['field_id_77'] == 'y' ? 1 : 0;
            $artwork = $row['field_id_68'] != '' ? '{{ _site_root }}assets/img/recordings/' . $title . '.jpg' : '';
            $producer = $row['producer'] != '' ? unserialize($row['producer']) : '';
            $performers = "\n  -\n";
            $ensembles = "\n  -\n";
            $conductors = "\n  -\n";
            $tracks = "\n  -\n";
            $quotes = "\n  -\n";

            if ($producer != '')
                $producer = '/producers/' . $this->createSlug($producer['query']->result[0]['title']);

            $ensembles_array = $row['field_id_70'] != '' ? explode("\r", $row['field_id_70']) : '';
            $conductors_array = $row['field_id_71'] != '' ? explode("\r", $row['field_id_71']) : '';
            $tracks_array = $row['field_id_72'] != '' ? explode("\r", $row['field_id_72']) : '';
            $performers_array = $row['field_id_73'] != '' ? explode("\r", $row['field_id_73']) : '';
            $quotes_array = $row['field_id_75'] != '' ? explode("\r", $row['field_id_75']) : '';

            if (is_array($ensembles_array))
            {
                $ensembles = '';

                foreach ($ensembles_array as $ensemble)
                {
                    $ensembles .= "\n  -\n";
                    $ensembles .= "    ensemble: /ensembles/" . $this->createSlug($this->removeBrackets($ensemble));
                }
            }
            else
                $ensembles .= "    ensemble: \"0\"";

            if (is_array($conductors_array))
            {
                $conductors = '';

                foreach ($conductors_array as $conductor)
                {
                    $conductors .= "\n  -\n";
                    $conductors .= "    conductor: /conductors/" . $this->createSlug($this->removeBrackets($conductor));
                }
            }
            else
                $conductors .= "    conductor: \"0\"";

            if (is_array($tracks_array))
            {
                $tracks = '';

                foreach ($tracks_array as $track)
                {
                    $tracks .= "\n  -\n";
                    $tracks .= "    track: /compositions/" . $this->createSlug($this->removeBrackets($track));
                }
            }
            else
                $tracks .= "    track: \"0\"";

            if (is_array($performers_array))
            {
                $performers = '';

                foreach ($performers_array as $performer)
                {
                    $performers .= "\n  -\n";
                    $performers .= "    performer: /performers/" . $this->createSlug($this->removeBrackets($performer));
                }
            }
            else
                $performers .= "    performer: \"0\"";

            if (is_array($quotes_array))
            {
                $quotes = '';

                foreach ($quotes_array as $quote)
                {
                    $quotes .= "\n  -\n";
                    preg_match('/\d+/', $quote, $rel_id);
                    $rel_id = $rel_id[0];
                    $rel_data = $this->db->query('select rel_child_id, rel_data from exp_relationships where rel_id = ' . $rel_id);
                    $rel_row = $rel_data->fetch();
                    $rel_data = unserialize($rel_row['rel_data']);
                    $author = $this->removeBrackets($rel_data['query']->result[0]['field_id_62']);
                    $quote_id = $rel_row['rel_child_id'];

                    if ($author != '')
                        $quote = $author;

                    $quotes .= "    quote: /quotes/" . $this->createSlug($this->removeBrackets($quote)) . "-".$quote_id;
                }
            }
            else
                $quotes .= "    quote: \"0\"";

            $description = str_replace($this->invalidHTML, $this->markdownReplacements, $row['field_id_74']);

$content = <<<EOD
---
title: '{$row['title']}'
release_date: $release_date
producer: $producer
catalog_number: {$row['field_id_67']}
artwork: $artwork
url: {$row['field_id_69']}
tribute: "$tribute"
performers: $performers
ensembles: $ensembles
conductors: $conductors
tracks: $tracks
quotes: $quotes
---
$description
EOD;

            $entityDir = sprintf('%s-%s', '02', 'recordings');
            $filename = $title;
            $dir = sprintf(self::VISIBLE_NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createSchedule()
    {
        ini_set('unserialize_callback_func', 'test');

        function test($className)
        {
            new $className();
        }

        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_titles.entry_date, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_data.entry_id = exp_weblog_titles.entry_id where exp_weblog_data.weblog_id = 7 order by exp_weblog_titles.entry_date DESC');
        $iterator = 1;

        foreach ($data as $row)
        {
            $title = $row['title'];
            $tribute = $row['field_id_46'] == 'y' ? 1 : 0;
            $row['entry_date'] = strtotime(self::DATE_OFFSET, $row['entry_date']);
            $event_date = $row['entry_date'] != 0 ? date('Y-m-d', $row['entry_date']) : '';
            $event_time = $row['entry_date'] != 0 ? date('h:i A', $row['entry_date']) : '';
            $location = '/facilities/' . $this->createSlug($this->removeBrackets($row['field_id_37']));
            $url = $row['field_id_15'];
            $ticket_information_url = $row['field_id_42'];
            $guest_performers = "\n  -\n";
            $ensembles = "\n  -\n";
            $conductors = "\n  -\n";
            $program = "\n  -\n";

            $guest_performers_array = $row['field_id_73'] != '' ? explode("\r", $row['field_id_73']) : '';
            $ensembles_array = $row['field_id_70'] != '' ? explode("\r", $row['field_id_70']) : '';
            $conductors_array = $row['field_id_71'] != '' ? explode("\r", $row['field_id_71']) : '';
            $program_array = $row['field_id_72'] != '' ? explode("\r", $row['field_id_72']) : '';

            if (is_array($ensembles_array))
            {
                $ensembles = '';

                foreach ($ensembles_array as $ensemble)
                {
                    $ensembles .= "\n  -\n";
                    $ensembles .= "    ensemble: /ensembles/" . $this->createSlug($this->removeBrackets($ensemble));
                }
            }
            else
                $ensembles .= "    ensemble: \"0\"";

            if (is_array($conductors_array))
            {
                $conductors = '';

                foreach ($conductors_array as $conductor)
                {
                    $conductors .= "\n  -\n";
                    $conductors .= "    conductor: /conductors/" . $this->createSlug($this->removeBrackets($conductor));
                }
            }
            else
                $conductors .= "    conductor: \"0\"";

            if (is_array($program_array))
            {
                $program = '';

                foreach ($program_array as $composition)
                {
                    $program .= "\n  -\n";
                    $program .= "    composition: /compositions/" . $this->createSlug($this->removeBrackets($composition));
                }
            }
            else
                $program .= "    composition: \"0\"";

            if (is_array($guest_performers_array))
            {
                $guest_performers = '';

                foreach ($guest_performers_array as $guest_performer)
                {
                    $guest_performers .= "\n  -\n";
                    $guest_performers .= "    guest_performer: /performers/" . $this->createSlug($this->removeBrackets($guest_performer));
                }
            }
            else
                $guest_performers .= "    guest_performer: \"0\"";

            $description = str_replace($this->invalidHTML, $this->markdownReplacements, $row['field_id_74']);

$content = <<<EOD
---
title: '$title'
tribute: "$tribute"
event_date: $event_date
event_time: $event_time
location: $location
url: $url
ticket_information_url: $ticket_information_url
program: $program
guest_performers: $guest_performers
ensembles: $ensembles
conductors: $conductors
---
$description
EOD;

            #echo '<pre>'.$content.'</pre>';
            #echo '<hr />';

            $entityDir = sprintf('%s-%s', '05', 'schedule');
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::VISIBLE_NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }
}
