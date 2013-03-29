/**
 * PrimeFaces Spinner Widget
 */
PrimeFaces.widget.Spinner = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.input = this.jq.children('.ui-spinner-input');
        this.upButton = this.jq.children('a.ui-spinner-up');
        this.downButton = this.jq.children('a.ui-spinner-down');
        if(this.cfg.step)
            this.cfg.precision = this.cfg.step.toString().split(/[,]|[.]/)[1].length;
        else
            this.cfg.step = 1;

        this.initValue();

        this.addARIA();

        if(this.input.prop('disabled')||this.input.prop('readonly')) {
            return;
        }

        this.bindEvents();
        
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);

        PrimeFaces.skinInput(this.input);
    },
    
    bindEvents: function() {
        var $this = this;

        this.jq.children('.ui-spinner-button')
            .on('mouseover.spinner', function() {
                $(this).addClass('ui-state-hover');
            })
            .on('mouseout.spinner', function() {
                $(this).removeClass('ui-state-hover ui-state-active');

                if($this.timer) {
                    clearInterval($this.timer);
                }
            })
            .on('mouseup.spinner', function() {
                clearInterval($this.timer);
                $(this).removeClass('ui-state-active').addClass('ui-state-hover');
            })
            .on('mousedown.spinner', function(e) {
                var element = $(this),
                dir = element.hasClass('ui-spinner-up') ? 1 : -1;

                element.removeClass('ui-state-hover').addClass('ui-state-active');
                
                if($this.input.is(':not(:focus)')) {
                    $this.input.focus();
                }

                $this.repeat(null, dir);

                //keep focused
                e.preventDefault();
        });

        this.input.on('keydown.spinner', function (e) {        
            var keyCode = $.ui.keyCode;
            
            switch(e.which) {            
                case keyCode.UP:
                    $this.spin($this.cfg.step);
                break;

                case keyCode.DOWN:
                    $this.spin(-1 * $this.cfg.step);
                break;

                default:
                    //do nothing
                break;
            }
        })
        .on('keyup.spinner', function () { 
            $this.updateValue();
        })
        .on('blur.spinner', function () { 
            $this.format();
        })
        .on('focus.spinner', function () {
            if($this.value !== null) {
                $this.input.val($this.value);
            }
        })
        .on('mousewheel.spinner', function(event, delta) {
            if($this.input.is(':focus')) {
                if(delta > 0)
                    $this.spin($this.cfg.step);
                else
                    $this.spin(-1 * $this.cfg.step);
                
                return false;
            }
        });

        if(this.cfg.behaviors) {
            PrimeFaces.attachBehaviors(this.input, this.cfg.behaviors);
        }
    },
    
    repeat: function(interval, dir) {
        var $this = this,
        i = interval||500;

        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            $this.repeat(40, dir);
        }, i);

        this.spin(dir);
    },
            
    toFixed: function (value, precision) {
        var power = Math.pow(10, precision||0);
        return String(Math.round(value * power) / power);
    },
                    
    spin: function(dir) {
        var step = this.cfg.step * dir,
        currentValue = this.value ? this.value : 0;
        
        if(this.cfg.precision)
            newValue = parseFloat(this.toFixed(currentValue + step, this.cfg.precision));
        else
            newValue = parseInt(currentValue + step);
    
        if(this.cfg.min !== undefined && newValue < this.cfg.min) {
            newValue = this.cfg.min;
        }

        if(this.cfg.max !== undefined && newValue > this.cfg.max) {
            newValue = this.cfg.max;
        }

        this.input.val(newValue);
        this.value = newValue;
        this.input.attr('aria-valuenow', newValue);

        this.input.change();
    },
    
    updateValue: function() {
        var value = this.input.val();

        if($.trim(value) === '') {
            if(this.cfg.min !== undefined)
                this.value = this.cfg.min;
            else
                this.value = null;
        }
        else {
            if(this.cfg.precision)
                value = parseFloat(value);
            else
                value = parseInt(value);
            
            if(!isNaN(value)) {
                if(this.cfg.max !== undefined && value > this.cfg.max) {
                    value = this.cfg.max;
                }
                
                if(this.cfg.min !== undefined && value < this.cfg.min) {
                    value = this.cfg.min;
                }
                
                this.value = value;
            }
        }
    },
    
    initValue: function() {
        var value = this.input.val();

        if($.trim(value) === '') {
            if(this.cfg.min !== undefined)
                this.value = this.cfg.min;
            else
                this.value = null;
        }
        else {
            if(this.cfg.prefix)
                value = value.split(this.cfg.prefix)[1];

            if(this.cfg.suffix)
                value = value.split(this.cfg.suffix)[0];

            if(this.cfg.precision)
                this.value = parseFloat(value);
            else
                this.value = parseInt(value);
        }
    },
     
    format: function() {
        if(this.value !== null) {
            var value = this.value;

            if(this.cfg.prefix)
                value = this.cfg.prefix + value;

            if(this.cfg.suffix)
                value = value + this.cfg.suffix;

            this.input.val(value);
        }
    },
    
    addARIA: function() {
        this.input.attr('role', 'spinner');
        this.input.attr('aria-multiline', false);
        this.input.attr('aria-valuenow', this.value);

        if(this.cfg.min !== undefined) 
            this.input.attr('aria-valuemin', this.cfg.min);

        if(this.cfg.max !== undefined) 
            this.input.attr('aria-valuemax', this.cfg.max);

        if(this.input.prop('disabled'))
            this.input.attr('aria-disabled', true);

        if(this.input.prop('readonly'))
            this.input.attr('aria-readonly', true);
    }
    
});