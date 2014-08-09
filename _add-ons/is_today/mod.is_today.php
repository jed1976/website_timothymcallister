<?php
class Modifier_is_today extends Modifier {

    const DATE_FORMAT = 'm/d/y';

    public function index($value, $parameters = array()) {
        return date(self::DATE_FORMAT, $value) == date(self::DATE_FORMAT);
    }
  }
