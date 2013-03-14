<?php
/*
 * Functions/Hooks to handle Field Collection Improvements
 * ------------------------------------------------------------
 */

// THIS IS NOT USED YET = TO INCLUDE THIS FILE, alter the .info file

/**
 * Implements hook_entity_info_alter().
 */
function gst_entityref_entity_info_alter(&$info) {
  // This runs when you SAVE on the ctype/display page (save the Display settings of an Entity)
  $i = $info;
}