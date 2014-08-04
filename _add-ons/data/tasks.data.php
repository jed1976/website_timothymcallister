<?php
class Tasks_data extends Tasks
{
    public function define() {
        $this->add(1, 'commit');
    }

    public function commit() {
        chdir(BASE_PATH);
        $output = shell_exec('git pull; git add --all; git commit -m "Auto commit"; git push origin master');
        return true;
    }
}