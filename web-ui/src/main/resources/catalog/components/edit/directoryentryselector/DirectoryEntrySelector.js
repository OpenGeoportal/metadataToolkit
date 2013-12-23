(function() {
  goog.provide('gn_directory_entry_selector');



  goog.require('gn_editor_xml_service');
  goog.require('gn_metadata_manager_service');
  goog.require('gn_schema_manager_service');

  var module = angular.module('gn_directory_entry_selector',
      ['gn_metadata_manager_service', 'gn_schema_manager_service',
       'gn_editor_xml_service']);

  /**
   *
   *
   */
  module.directive('gnDirectoryEntrySelector',
      ['$rootScope', '$timeout', '$q', '$http',
        'gnEditor', 'gnSchemaManagerService',
        'gnEditorXMLService', 'gnUrlUtils', 'gnConfig',
        'gnCurrentEdit',
        function($rootScope, $timeout, $q, $http, 
            gnEditor, gnSchemaManagerService, 
            gnEditorXMLService, gnUrlUtils, gnConfig, 
            gnCurrentEdit) {

         return {
           restrict: 'A',
           replace: false,
           scope: {
             mode: '@gnDirectoryEntrySelector',
             elementName: '@',
             elementRef: '@',
             domId: '@',
             templateAddAction: '@'
           },
           templateUrl: '../../catalog/components/edit/' +
           'directoryentryselector/partials/' +
           'directoryentryselector.html',
           link: function(scope, element, attrs) {
             // Separator between each contact XML
             // snippet
             var separator = '&&&';
             scope.gnConfig = gnConfig;
             scope.templateAddAction = scope.templateAddAction === 'true';

             // Search only for contact subtemplate
             scope.params = {
               _root: 'gmd:CI_ResponsibleParty',
               _isTemplate: 's',
               fast: 'false'
             };

             scope.snippet = null;
             scope.snippetRef = gnEditor.
             buildXMLFieldName(scope.elementRef, scope.elementName);

             scope.add = function() {
               gnEditor.add(gnCurrentEdit.id,
                   scope.elementRef, scope.elementName,
                   scope.domId, 'before').then(function() {
                 if (scope.templateAddAction) {
                   gnEditor.save(gnCurrentEdit.id, true);
                 }
               });
               return false;
             };

             // <request><codelist schema="iso19139"
             // name="gmd:CI_RoleCode" /></request>
             scope.addContact = function(contact, role, usingXlink) {
               if (!(contact instanceof Array)) {
                 contact = [contact];
               }

               scope.snippet = '';
               var snippets = [];

               var checkState = function() {
                 if (snippets.length === contact.length) {
                   scope.snippet = snippets.join(separator);

                   // Clean results
                   // TODO: should call clean result from searchFormController
                   //                   scope.searchResults.records = null;
                   //                   scope.searchResults.count = null;

                    $timeout(function() {
                      // Save the metadata and refresh the form
                      gnEditor.save(gnCurrentEdit.id, true);
                    });
                 }
               };

               angular.forEach(contact, function(c) {
                 var id = c['geonet:info'].id,
                 uuid = c['geonet:info'].uuid;
                 var params = {uuid: uuid};
                 if (role) {
                   params.process =
                   'gmd:role/gmd:CI_RoleCode/@codeListValue~' + role;
                 }
                 var url = gnUrlUtils.append(
                     // TODO: Get URL from gnHttp
                     'http://localhost:8080/geonetwork/srv/eng/' +
                     'subtemplate',
                     gnUrlUtils.toKeyValue(params));

                 // FIXME: this call is useless when using XLink
                 $http.get(url).success(function(xml) {
                   if (usingXlink) {
                     snippets.push(gnEditorXMLService.
                     buildXMLForXlink(scope.elementName, url));
                   } else {
                     snippets.push(gnEditorXMLService.
                     buildXML(scope.elementName, xml));
                   }
                   checkState();
                 });

               });

               return false;
             };

             // TODO: Schema should be a parameter
             gnSchemaManagerService
             .getCodelist('iso19139|gmd:CI_RoleCode')
             .then(function(data) {
               scope.roles = data[0].entry;
             });

           }
         };
       }]);

  module.directive('gnDirectoryEntryMultiSelector',
      [
        function() {

         return {
           restrict: 'A',
           replace: true,
           templateUrl: '../../catalog/components/edit/' +
           'directoryentryselector/partials/' +
           'directoryentrymultiselector.html',
           link: function(scope, element, attrs) {
             scope.selected = [];
           }
         };
       }]);

})();
