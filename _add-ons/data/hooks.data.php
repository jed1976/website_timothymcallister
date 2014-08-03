<?php
class Hooks_Data extends Hooks
{
    public function control_panel__publish($data)
    {
        echo '<pre>';
        print_r($data);
        echo '</pre>';

        //File::delete(Path::assemble(BASE_PATH, $data['file']));

        //$data['file'] = str_replace('-1407024905', '-'.time(), $data['file']);


        //die();



        // echo '<pre>';
        // print_r($data);
        // echo '</pre>';



        return $data;
    }
}