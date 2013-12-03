PrimeFaces.dialog = {};

PrimeFaces.dialog.DialogHandler = {
		
    openDialog: function(cfg) {
        var dialogId = cfg.sourceComponentId + '_dlg';
        if(document.getElementById(dialogId)) {
            return;
        }

        var dialogWidgetVar = cfg.sourceComponentId.replace(/:/g, '_') + '_dlgwidget',
        dialogDOM = $('<div id="' + dialogId + '" class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-shadow ui-overlay-hidden"' + 
                ' data-pfdlgcid="' + cfg.pfdlgcid + '" data-widgetvar="' + dialogWidgetVar + '"/>')
                .append('<div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"><span class="ui-dialog-title"></span>' +
                '<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-closethick"></span></a></div>' + 
                '<div class="ui-dialog-content ui-widget-content" style="height: auto;">' +
                '<iframe style="border:0 none" frameborder="0"/>' + 
                '</div>')
                .appendTo(document.body),
        dialogFrame = dialogDOM.find('iframe'),
        symbol = cfg.url.indexOf('?') === -1 ? '?' : '&',
        frameURL = cfg.url + symbol + 'pfdlgcid=' + cfg.pfdlgcid,
        frameWidth = cfg.options.contentWidth||640;

        dialogFrame.width(frameWidth);

        dialogFrame.on('load', function() {
            var $frame = $(this),
            titleElement = $frame.contents().find('title');
            
            if(!$frame.data('initialized')) {
                PrimeFaces.cw('Dialog', dialogWidgetVar, {
                    id: dialogId,
                    position: 'center',
                    sourceComponentId: cfg.sourceComponentId,
                    sourceWidget: cfg.sourceWidget,
                    onHide: function() {
                        this.jq.remove();
                        PF[dialogWidgetVar] = undefined;
                    },
                    modal: cfg.options.modal,
                    resizable: cfg.options.resizable,
                    draggable: cfg.options.draggable,
                    width: cfg.options.width,
                    height: cfg.options.height
                });
            }
            
            if(titleElement.length > 0) {
                PF(dialogWidgetVar).titlebar.children('span.ui-dialog-title').html(titleElement.text());
            }
            
            //adjust height
            var frameHeight = cfg.options.contentHeight||$frame.get(0).contentWindow.document.body.scrollHeight + 5;
            $frame.height(frameHeight);
            
            PF(dialogWidgetVar).show();
            
            dialogFrame.data('initialized', true);
        })
        .attr('src', frameURL);
    },

    closeDialog: function(cfg) {
        var dlg = $(document.body).children('div.ui-dialog').filter(function() {
            return $(this).data('pfdlgcid') === cfg.pfdlgcid;
        }),
        dlgWidget = PF(dlg.data('widgetvar')),
        sourceWidget = dlgWidget.cfg.sourceWidget,
        sourceComponentId = dlgWidget.cfg.sourceComponentId,
        dialogReturnBehavior = null;

        if(sourceWidget && sourceWidget.cfg.behaviors) {
            dialogReturnBehavior = sourceWidget.cfg.behaviors['dialogReturn'];
        }
        else if(sourceComponentId) {
            var dialogReturnBehaviorStr = $(document.getElementById(sourceComponentId)).data('dialogreturn');
            if(dialogReturnBehaviorStr) {
                dialogReturnBehavior = eval('(function(){' + dialogReturnBehaviorStr + '})');
            }

        }
                    
        if(dialogReturnBehavior) {
            var ext = {
                    params: [
                        {name: sourceComponentId + '_pfdlgcid', value: cfg.pfdlgcid}
                    ]
                };
            
            dialogReturnBehavior.call(this, null, ext);
        }
        
        dlgWidget.hide();
    },
            
    showMessageInDialog: function(msg) {
        if(!this.messageDialog) {
            var messageDialogDOM = $('<div id="primefacesmessagedlg" class="ui-message-dialog ui-dialog ui-widget ui-widget-content ui-corner-all ui-shadow ui-overlay-hidden"/>')
                        .append('<div class="ui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"><span class="ui-dialog-title"></span>' +
                        '<a class="ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all" href="#" role="button"><span class="ui-icon ui-icon-closethick"></span></a></div>' + 
                        '<div class="ui-dialog-content ui-widget-content" style="height: auto;"></div>')
                        .appendTo(document.body);

            PrimeFaces.cw('Dialog', 'primefacesmessagedialog', {
                id: 'primefacesmessagedlg', 
                modal:true,
                draggable: false,
                resizable: false,
                showEffect: 'fade',
                hideEffect: 'fade'
            });
            this.messageDialog = PF('primefacesmessagedialog');
            this.messageDialog.titleContainer = this.messageDialog.titlebar.children('span.ui-dialog-title');
        }

        this.messageDialog.titleContainer.text(msg.summary);
        this.messageDialog.content.html('').append('<span class="ui-dialog-message ui-messages-' + msg.severity.split(' ')[0].toLowerCase() + '-icon" />').append(msg.detail);
        this.messageDialog.show();
    },
            
    confirm: function(msg) {
        if(PrimeFaces.confirmDialog) {
            PrimeFaces.confirmSource = $(PrimeFaces.escapeClientId(msg.source));
            PrimeFaces.confirmDialog.showMessage(msg);
        }
        else {
            PrimeFaces.warn('No global confirmation dialog available.');
        }
    }
};
