/*
 * This file should be edited to include only the needed modules for a
 * application.
 *
 * The purpose of this file is to include all the unhosted modules that should
 * be available for use after build. So that require.js's optimization tool can
 * pick up the dependencies and include them.
 */

define(['modules/UJJP-KeyValue'
        , 'modules/UUJP-MessageQueue']
       , function(){ return {}; });
