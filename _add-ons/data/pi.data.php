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
 * Plugin_Data
 * Data conversion plugin for www.timothymcallister.com
 * @author  Joe Dakroub <joe.dakroub@me.com>
 * @version 1.0
 */

class Plugin_Data extends Plugin
{
    public $meta = array(
        'name'       => 'Data Conversion',
        'version'    => '1.0.0',
        'author'     => 'Joe Dakroub'
    );

    const API_KEY = 'AIzaSyA2Kd093BDPlBJhWykIlVOEHamfG4_8WKo';

    const CONTENT_DIR = '_content/';

    const NUMBER_FORMAT = '%s%s/_%02s.%s.md';

    const VISIBLE_NUMBER_FORMAT = '%s%s/%02s.%s.md';

    const VISIBLE_DATE_FORMAT = '%s%s/%02s-%s.md';

    const VISIBLE_DATE_FORMAT_NO_EXTENSION = '%s%s/%02s-%s%s.md';

    const INDEX = '08';

    const REGEX_BRACKET = '/\[\d+\]\s+/';

    // Original timezone of the server the imported data resided on was America/Chicago
    // Using America/Detroit puts the event dates 5 hours ahead
    const DATE_OFFSET = '-5 hours'; // This may need to change based on the server the app is deployed to

    public $invalidCharacters = array('!', ':', '/', '(', ')', '"', '\'', ',', '.', '?', ';');

    public $invalidHTML = array('**', '<B>', '</B>', '<b>', '</b>', '<I>', '</I>', '<i>', '</i>', '&#8217;');

    public $markdownReplacements = array('', '**', '**', '**', '**', '*', '*', '*', '*', '\'');

    public $data = array(
        // 'biography',
        // 'contact',
        // 'live-performances'
        // 'performances',
        // 'premieres'
        // 'premiere-categories'
        // 'producers',
        'quotes',
        // 'recordings',
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

        set_time_limit(0);

        foreach ($this->data as $entity)
        {
            $method = 'create' . ucfirst(str_replace('-', '', $entity));
            $this->$method();
        }

        $this->db = null;
    }

    private function removeBrackets($string)
    {
        return preg_replace(self::REGEX_BRACKET, '', $string);
    }

    private function getLocationData($location)
    {
        $location = $this->removeBrackets($location);
        $return = array('location' => '', 'latitude' => 0, 'longitude' => 0);

        if ($location == '')
            return $return;

        switch ($location)
        {
            case 'Bloomfield Hills, MI':
                $location = 'Detroit Chamber Winds';
            break;

            case 'New World Symphony New Campus':
                $location = 'New World Symphony';
            break;

            case 'The Icebox at Crane Arts':
                $location = 'Crane Arts LLC';
            break;

            case 'Symphony Space - Leonard Nimoy Thalia':
            case 'Symphony Space\'s Leonard Nimoy Thalia':
                $location = 'Thalia Theatre Leonard Nimoy';
            break;

            case 'Ravinia Festival Pavilion':
                $location = 'Ravinia Festival Administration';
            break;

            case 'SPACE':
                $location = 'Evanston Space';
            break;

            case 'Chicago, IL':
            case 'Chicago, Illinois':
            case 'Chicago':
            case 'Symphony Hall':
                $location = 'Chicago Symphony Orchestra';
            break;
        }

        $location = urlencode($location);
        $url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?sensor=false&input=' . $location . '&key=' . self::API_KEY;
        $result = file_get_contents($url);
        $data = json_decode($result, TRUE);

        if ($data['status'] == 'OK')
        {
            $location = $data['predictions'][0]['terms'][0]['value'];
            $description = $data['predictions'][0]['description'];
            $url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($description) . '&key=' . self::API_KEY;
            $result = file_get_contents($url);
            $data = json_decode($result, TRUE);

            if ($data['status'] == 'OK')
            {
                $coordinates = $data['results'][0]['geometry']['location'];
                $return['location'] = $location;
                $return['latitude'] = $coordinates['lat'];
                $return['longitude'] = $coordinates['lng'];
            }
        }

        return $return;
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
page_icon: user
page_id: biography
page_stylesheet: biography
theme: dark
title: Biography
artwork: '{{ _site_root }}assets/img/tim-biography.jpg'
_fieldset: biography
_template: biography
pdfs:
  -
    label: Download Full Biography
    pdf: '{{ _site_root }}assets/pdf/timothy-mcallister-full-biography.pdf'
  -
    label: Download Short Biography
    pdf: '{{ _site_root }}assets/pdf/timothy-mcallister-short-biography.pdf'
vertical_position: top
horizontal_position: left
quotes:
  -
    quote: /quotes/william-bolcom
  -
    quote: /quotes/leone-buyse
  -
    quote: /quotes/michael-segell
  -
    quote: /quotes/jean-marie-londeix
---
$biography
EOD;

            $entityDir = sprintf('_content/%s-%s', '01', 'biography');
            $filename = 'page.md';
            $dir = sprintf('%s/%s', $entityDir, $filename);
            file_put_contents($dir, $content);
        }
    }

    private function createContact()
    {
$content = <<<EOD
---
page_id: contact
page_stylesheet: contact
theme: dark
title: Contact
_fieldset: contact
_template: contact
---
EOD;

        $entityDir = sprintf('_content/%s-%s', '06', 'contact');
        $filename = 'page.md';
        $dir = sprintf('%s/%s', $entityDir, $filename);
        file_put_contents($dir, trim($content));

        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 41 order by exp_weblog_titles.title');
        $iterator = 1;
        $titles = array(1 => array('School', 'school.jpg'), 2 => array('Summer', 'summer.jpg'));

        foreach ($data as $row)
        {
            $contact_info_parts = unserialize($row['field_id_85']);

            foreach ($contact_info_parts as $contact)
            {
                $key = $titles[$iterator];
$content = <<<EOD
---
title: {$key[0]}
name: {$contact[1]}
position:
organization: {$contact[2]}
unit: {$contact[3]}
address_1: {$contact[4]}
address_2:
city: {$contact[5]}
state: {$contact[6]}
zip_code: {$contact[7]}
email: {$contact[8]}
artwork: '{{ _site_root }}assets/img/{$key[1]}'
---
EOD;

                $entityDir = sprintf('%s-%s', '06', 'contact');
                $filename = $this->createSlug($key[0]);
                $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);

                file_put_contents($dir, $content);
                $iterator++;
            }
        }
    }

    private function createPremierecategories()
    {
        $data = $this->db->query("select distinct exp_categories.cat_name from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id left join exp_category_posts on exp_category_posts.entry_id = exp_weblog_titles.entry_id left join exp_categories on exp_categories.cat_id = exp_category_posts.cat_id where exp_weblog_data.weblog_id = 13 and exp_weblog_data.field_id_58 = 'y' order by exp_weblog_titles.title");
        $iterator = 1;
        $icon = '';

        foreach ($data as $row)
        {
            if ($row['cat_name'] == null)
                continue;

            switch ($iterator)
            {
                case 1:
                    $icon = 'quartet';
                break;

                case 2:
                    $icon = 'ensemble';
                break;

                case 3:
                    $icon = 'saxophone';
                break;
            }

$content = <<<EOD
---
title: '{$row['cat_name']}'
icon: $icon
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'premiere-categories');
            $filename = $this->createSlug($row['cat_name']);

            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createPremieres()
    {
        $data = $this->db->query("select exp_weblog_titles.title, exp_weblog_data.field_id_44, exp_weblog_data.field_id_54, exp_categories.cat_name from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id left join exp_category_posts on exp_category_posts.entry_id = exp_weblog_titles.entry_id left join exp_categories on exp_categories.cat_id = exp_category_posts.cat_id where exp_weblog_data.weblog_id = 13 and exp_weblog_data.field_id_58 = 'y' order by exp_weblog_titles.title");
        $iterator = 1;

        foreach ($data as $row)
        {
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

            if ($row['cat_name'] == '')
                $category = 'Saxophone Solo or Saxophone With Electronics, Piano or Orchestra';

            $datestamp = $row['field_id_44'].'-01-01';
            $composer = $this->removeBrackets($row['field_id_54']);
            $category = '/premiere-categories/' . $this->createSlug($row['cat_name']);

$content = <<<EOD
---
title: '{$row['title']}'
composer: $composer
category: $category
---

EOD;

            $entityDir = sprintf('%s-%s', '04', 'premieres');
            $filename = $this->createSlug($row['title']);

            $dir = sprintf(self::VISIBLE_DATE_FORMAT, self::CONTENT_DIR, $entityDir, $datestamp, $filename);
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
producer_url: {$row['field_id_64']}
---

EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'producers');
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createQuotes()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_weblog_titles.entry_date, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_titles.entry_id = exp_weblog_data.entry_id where exp_weblog_data.weblog_id = 4 order by exp_weblog_titles.title');
        $iterator = 1;
        $adamsPress = array('john', 'adams');
        $quotes = array();

        function containsString($str, array $arr) {
            foreach($arr as $a) {
                if (stripos($str, $a) !== false) return true;
            }

            return 0;
        }

        function cmp($a, $b)
        {
            if ($a['name'] == $b['name'])
                return 0;

            return ($a['name'] < $b['name']) ? -1 : 1;
        }

        foreach ($data as $row)
        {
            $row['field_id_62'] = $this->removeBrackets($row['field_id_62']);

            if ($row['field_id_62'] == 'JeanMarie Londeix')
                $row['field_id_62'] = 'Jean-Marie Londeix';

            $row['field_id_62'] = $row['field_id_62'] != '' ? $row['field_id_62'] : $row['title'];
            $row['title'] = $row['field_id_62'];
            $slug = $this->createSlug($row['field_id_62']);

            $quotes[] = array(
                'datestamp' => date('Y-m-d', $row['entry_date']),
                'name' => $row['field_id_62'],
                'title' => $row['title'],
                'quote' => trim($row['field_id_11']),
                'source' => $row['field_id_13'],
                'adams_press' => containsString($row['field_id_11'], $adamsPress)
            );
        }

        usort($quotes, 'cmp');

        foreach ($quotes as $quote)
        {
$content = <<<EOD
---
title: {$quote['title']}
source: {$quote['source']}
adams_press: {$quote['adams_press']}
---
"{$quote['quote']}"
EOD;


            $entityDir = sprintf('_%s-%s', self::INDEX, 'quotes');
            $filename = $this->createSlug($quote['title']);
            $dir = sprintf(self::VISIBLE_DATE_FORMAT, self::CONTENT_DIR, $entityDir, $quote['datestamp'], $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }

        die();
    }

    private function createRecordings()
    {
        ini_set('unserialize_callback_func', 'test');

        function test($className)
        {
            new $className();
        }

        $data = $this->db->query('select exp_weblog_titles.title, exp_relationships.rel_data as producer, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_data.entry_id = exp_weblog_titles.entry_id left join exp_relationships on exp_weblog_data.field_id_66 = exp_relationships.rel_id where exp_weblog_data.weblog_id = 33 AND exp_relationships.rel_data != "" order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
            $title = $this->createSlug($row['title']);
            $row['field_id_65'] = strtotime(self::DATE_OFFSET, $row['field_id_65']);
            $release_date = $row['field_id_65'] != 0 ? date('Y-m-d', $row['field_id_65']) : date('Y-m-d');
            $tribute = $row['field_id_77'] == 'y' ? 1 : 0;
            $artwork = $row['field_id_68'] != '' ? '{{ _site_root }}assets/img/recordings/' . $title . '.jpg' : '';
            $producer = $row['producer'] != '' ? unserialize($row['producer']) : '';

            if ($producer != '')
                $producer = '/producers/' . $this->createSlug($producer['query']->result[0]['title']);

            $ensembles_array = $row['field_id_70'] != '' ? explode("\r", $row['field_id_70']) : '';
            $conductors_array = $row['field_id_71'] != '' ? explode("\r", $row['field_id_71']) : '';

            if (is_array($ensembles_array))
                $ensemble = "/ensembles/" . $this->createSlug($this->removeBrackets($ensembles_array[0]));
            else
                $ensemble = "";

            if (is_array($conductors_array))
                $conductor = "/conductors/" . $this->createSlug($this->removeBrackets($conductors_array[0]));
            else
                $conductor = "";

            $sample = '{{ _site_root }}assets/audio/recordings/' . $title . '.mp3';
            $description = str_replace($this->invalidHTML, $this->markdownReplacements, $row['field_id_74']);

$content = <<<EOD
---
title: '{$row['title']}'
producer: $producer
catalog_number: {$row['field_id_67']}
recording_url: {$row['field_id_69']}
ensemble: $ensemble
conductor: $conductor
artwork: $artwork
sample: $sample
---
$description
EOD;

            $entityDir = sprintf('%s-%s', '02', 'recordings');
            $filename = $title;
            $dir = sprintf(self::VISIBLE_DATE_FORMAT, self::CONTENT_DIR, $entityDir, $release_date, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createLivePerformances()
    {
        $data = $this->db->query('select exp_weblog_titles.title, exp_relationships.rel_data as producer, exp_weblog_data.* from exp_weblog_data left join exp_weblog_titles on exp_weblog_data.entry_id = exp_weblog_titles.entry_id left join exp_relationships on exp_weblog_data.field_id_66 = exp_relationships.rel_id where exp_weblog_data.weblog_id = 33 AND exp_weblog_data.field_id_68 = "" order by exp_weblog_titles.title');
        $iterator = 1;

        foreach ($data as $row)
        {
            $title = $this->createSlug($row['title']);
            $composer = '';

            switch ($row['title'])
            {
                case "Abduction from Montag aus Licht":
                    $composer = 'Karlheinz Stockhausen';
                break;

                case "Children's Songs":
                    $composer = 'Chick Corea';
                break;

                case "Concerto for Alto Saxophone and 11 Instruments":
                    $composer = 'Andrew Mead';
                break;

                case "Concerto for Alto Saxophone and Wind Orchestra":
                    $composer = 'Ingolf Dahl';
                break;

                case "Csardas":
                    $composer = 'Vittorio Monti';
                break;

                case "Deep Blue (2003) for alto saxophone and percussion":
                    $composer = 'Luca Vanneschi';
                break;

                case "Duo Sonata for Two Baritone Saxophones":
                    $composer = 'Sofia Gubaidulina';
                break;

                case "Escapades: Suite from \"Catch Me If You Can\"":
                    $composer = 'John Williams';
                break;

                case "Six Bagatelles (2002) for alto saxophone and bassoon":
                    $composer = 'Andrew Mead';
                break;

                case "Sonata, Mvt. IV Nocturne et Final":
                    $composer = 'Fernande Decruck';
                break;

                case "Urban Thoughts for Alto Saxophone and Chamber Orchestra":
                    $composer = 'Daniel Worley';
                break;
            }

            $sample = '{{ _site_root }}assets/audio/live-performances/' . $title . '.mp3';

$content = <<<EOD
---
title: '{$row['title']}'
composer: $composer
sample: $sample
---
EOD;

            $entityDir = sprintf('_%s-%s', self::INDEX, 'live-performances');
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::NUMBER_FORMAT, self::CONTENT_DIR, $entityDir, $iterator, $filename);
            file_put_contents($dir, $content);
            $iterator++;
        }
    }

    private function createPerformances()
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
            sleep(1); // Must sleep for the time stamp to be different for every row
            $title = $row['title'];
            $tribute = $row['field_id_46'] == 'y' ? 1 : 0;
            $row['entry_date'] = strtotime(self::DATE_OFFSET, $row['entry_date']);
            $event_date = $row['entry_date'] != 0 ? date('Y-m-d', $row['entry_date']) : '';
            $event_time = $row['entry_date'] != 0 ? date('h:i A', $row['entry_date']) : '';
            $url = $row['field_id_15'];
            $ticket_information_url = $row['field_id_42'];
            $ensembles_array = $row['field_id_70'] != '' ? explode("\r", $row['field_id_70']) : '';
            $conductors_array = $row['field_id_71'] != '' ? explode("\r", $row['field_id_71']) : '';

            if (is_array($ensembles_array))
                $ensemble = $this->removeBrackets($ensembles_array[0]);
            else
                $ensemble = "";

            if (is_array($conductors_array))
                $conductor = $this->removeBrackets($conductors_array[0]);
            else
                $conductor = "";

            $description = str_replace($this->invalidHTML, $this->markdownReplacements, $row['field_id_18']);

            $entityDir = sprintf('%s-%s', '03', 'performances');
            $filename = $this->createSlug($row['title']);
            $dir = sprintf(self::VISIBLE_DATE_FORMAT_NO_EXTENSION, self::CONTENT_DIR, $entityDir, $event_date, $filename, '___'.time());

            if (file_exists($dir)) {
                continue;
            } else {
                $locationData = $this->getLocationData($row['field_id_37']);
                $location = $locationData['location'];
                $latitude = $locationData['latitude'];
                $longitude = $locationData['longitude'];

$content = <<<EOD
---
title: '$title'
event_time: $event_time
location: $location
latitude: $latitude
longitude: $longitude
performance_url: $url
ticket_information_url: $ticket_information_url
ensemble: $ensemble
conductor: $conductor
---
$description
EOD;


                file_put_contents($dir, $content);
                $iterator++;
            }
        }
    }
}
