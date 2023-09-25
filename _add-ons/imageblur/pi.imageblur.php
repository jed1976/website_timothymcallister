<?php

/**
 * Plugin_imageblur
 * Blur images using ImageMagick
 *
 * @author  Joe Dakroub <joe.dakroub@me.com>
 *
 * @copyright  2014
 */

class Plugin_imageblur extends Plugin
{
    public function index()
    {
        /*
        |--------------------------------------------------------------------------
        | Check for image
        |--------------------------------------------------------------------------
        |
        | Transform just needs the path to an image to get started. If it exists,
        | the fun begins.
        |
        */

        $image_src = $this->fetchParam('src', null, false, false, false);

        // Set full system path
        $image_path = Path::standardize(Path::fromAsset($image_src));

        // Check if image exists before doing anything.
        if ( ! File::isImage($image_path)) {

            Log::error("Could not find requested image to transform: " . $image_path, "core", "Transform");

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Extra bits
        |--------------------------------------------------------------------------
        |
        | Delicious and probably rarely used options.
        |
        */

        $strength = $this->fetchParam('strength', 40, 'is_numeric');
        $action = 'blur';

        /*
        |--------------------------------------------------------------------------
        | Assemble filename and check for duplicate
        |--------------------------------------------------------------------------
        |
        | We need to make sure we don't already have this image created, so we
        | defer any action until we've processed the parameters, which create
        | a unique filename.
        |
        */

        // Late modified time of original image
        $last_modified = File::getLastModified($image_path);

        // Find .jpg, .png, etc
        $extension = File::getExtension($image_path);

        // Filename with the extension removed so we can append our unique filename flags
        $stripped_image_path = str_replace('.' . $extension, '', $image_path);

        // The possible filename flags
        $parameter_flags = array(
            'strength' => $strength,
            'modified'  => $last_modified
        );

        // Start with a 1 character action flag
        $file_breadcrumbs = '-'.$action[0];

        foreach ($parameter_flags as $param => $value) {
            if ($value) {
                $flag = is_bool($value) ? '' : $value; // don't show boolean flags
                $file_breadcrumbs .= '-' . $param[0] . $flag;
            }
        }

        // Allow converting filetypes (jpg, png, gif)
        $extension = $this->fetchParam('type', $extension);

        // Allow saving in a different directory
        $destination = $this->fetchParam('destination', Config::get('transform_destination', false), false, false, false);


        if ($destination) {

            $destination = Path::tidy(BASE_PATH . '/' . $destination);

            // Method checks to see if folder exists before creating it
            Folder::make($destination);

            $stripped_image_path = Path::tidy($destination . '/' . basename($stripped_image_path));
        }

        // Reassembled filename with all flags filtered and delimited
        $new_image_path = $stripped_image_path . $file_breadcrumbs . '.' . $extension;

        // Check if we've already built this image before
        if (File::exists($new_image_path)) {
            return Path::toAsset($new_image_path);
        }

        /*
        |--------------------------------------------------------------------------
        | Save
        |--------------------------------------------------------------------------
        |
        | Get out of dodge!
        |
        */

        try {
            exec('/usr/local/bin/convert '. $image_path . ' -blur 0x'. $strength .' '. $new_image_path);
        } catch(Exception $e) {
            Log::fatal('Could not write new images. Try checking your file permissions.', 'core', 'Transform');
            throw new Exception('Could not write new images. Try checking your file permissions.');
        }

        return File::cleanURL($new_image_path);
    }
}