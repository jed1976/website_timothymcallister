<?php
class Fieldtype_Audiofile extends Fieldtype_File
{
    public function process()
    {
        parent::process();


        // if ($this->field_data['tmp_name'] !== '') {
        //     $filePath = $this->settings['destination'].$this->field_data;
        //     $fileWithoutExtension = basename($this->field_data);
        //     File::upload($this->field_data, $this->settings['destination'], true);
        //     passthru('nohup ffmpeg -i '.$file.' -vcodec libtheora -acodec '.$this->settings['destination'].$fileWithoutExtension.'.ogg');
        //     return;
        // }
    }
}