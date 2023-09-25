<?php
class Hooks_Data extends Hooks
{
    public function control_panel__publish($data)
    {
        // Rename event file
        if (isset($data['yaml']) && isset($data['yaml']['event_time'])) {
            $file = preg_replace('/___(\d)+/', '___'.time(), $data['file']);
            $path = Path::assemble(BASE_PATH, $data['file']);

            if (File::exists($path))
                File::delete($path);
            else
                $file = str_replace('.md', '___'.time().'.md', $file);

            $data['file'] = $file;
        }

        return $data;
    }
}
