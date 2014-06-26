<?php
define('CONTENT_DIR', '../_content/');
define('ENTRY_DIR', '_10-composers/');
define('FORMAT', '%s%s_%02s-%s.md');

$entities = explode("\n", file_get_contents('../_data/composers.txt'));
$iterator = 1;

foreach ($entities as $entity)
{
$content = <<<EOD
---
title: $entity
---

EOD;

    file_put_contents(sprintf(FORMAT, CONTENT_DIR, ENTRY_DIR, $iterator, $entity), $content);
    $iterator++;
}
