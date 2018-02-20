$(function() {
    var $container = $('.main-page');

    var $customersList = $('#customersList');
    var $customerListTable = $('.table');

    var $addNewCustomerBtn = $('#addNewCustomerBtn');

    var $addNewCustomerForm = $('#addNewCustomerForm');
    var $formFields = $('.form-field');
    var $customerId = $('#customerId');
    var $moneySpent = $('#moneySpent');
    var $ordersCount = $('#ordersCount');
    var $customerName = $('#customerName');
    var $customerSurname = $('#customerSurname');
    var $manager = $('#manager');
    var $submitNewCustomerBtn = $('#submitNewCustomerBtn');
    var $cancelNewCustomerBtn = $('#cancelNewCustomerBtn');

    var $newOrderWindow = $('#newOrderWindow');
    var $modalFormField = $('.modal-form-field');

    var customersListTemplate = $('#customersListTemplate').html();

    var baseURL = 'http://5a85a7b1085fdd00127042ad.mockapi.io';

    function request(method, uri, data) {
        return $.ajax(baseURL + uri, {
            method: method,
            data: data
        });
    }

    function loadCustomersList() {
        $('tr').remove('.customer-row');
        var promised = request('GET', '/customers', {});
        getCustomersList(promised);
    }

    function getCustomersList(promised) {
            promised.then(function(data) {
                renderCustomersList(data);
            });
    }

    loadCustomersList();

    $addNewCustomerBtn.click(onAddNewCustomerBtnClick);

    $customersList.on('click', '.new-order-btn', onNewOrderBtnClick)
                   .on('click', '.edit-btn', onEditBtnClick)
                   .on('click', '.remove-btn', onRemoveBtnClick);

    $addNewCustomerForm.change(onAddNewCustomerFormChange)
                       .submit(onAddCustomersFormSubmit);

    $cancelNewCustomerBtn.click(onCancelNewCustomerBtnClick);


    function renderCustomersList(data) {
        for (var i = 0; i < data.length; i++) {
            var row = customersListTemplate
                .replace('{{id}}', data[i].id)
                .replace('{{name}}', data[i].name)
                .replace('{{surname}}', data[i].surname)
                .replace('{{date}}', data[i].createdAt)
                .replace('{{moneySpent}}', data[i].moneySpent)
                .replace('{{ordersCount}}', data[i].ordersCount)
                .replace('{{manager}}', data[i].manager);
            $customersList.append(row);
        }
    }

    function onAddNewCustomerBtnClick() {
        toggleDisplayMode();
    }

    function toggleDisplayMode() {
        $container.toggleClass('show-add-new-customer-form');
    }

    function onRemoveBtnClick(event) {
        event.preventDefault();
        var id = $(this).closest('tr').data('id');

        deleteCustomerFromServer(id);
    }

    function onAddNewCustomerFormChange() {
        checkFormValid();
    }

    function onAddCustomersFormSubmit(event) {
        event.preventDefault();
        createNewCustomer();
        clearAddNewCustomerForm();
        toggleDisplayMode();

    }

    function onEditBtnClick() {
        var id = $(this).closest('tr').data('id');
        getCustomerData(id);
        toggleDisplayMode();
    }

    function onCancelNewCustomerBtnClick(event) {
        event.preventDefault();
        clearAddNewCustomerForm();
        toggleDisplayMode();
    }

    /* function onNewOrderBtnClick(event) {
            event.preventDefault();
            var id = $(this).closest('tr').data('id');
            var promised = request('GET', '/customers/' + id, {}).then(function(data){
                fillModalWindowForm(data);
                openModalWindow();
            });
    } */

    function createNewCustomer() {
        var customer = {
            id: $('.customerId').val(),
            name: $customerName.val(),
            surname: $customerSurname.val(),
            manager: $manager.val(),
            createdAt: new Date().toDateString(),
            moneySpent: Number($('.moneySpent').val()),
            ordersCount: Number($('.ordersCount').val())
        };
        setCustomer(customer);
    }

    function setCustomer(customer) {
        if (customer.id) {
            updateCustomer(customer);
        } else {
            loadNewCustomer(customer);
        }
    }

    function loadNewCustomer(customer) {
        var promised = request('POST', '/customers/', customer)
                    .then(function() {
                        loadCustomersList();
                    });
    }

    function clearAddNewCustomerForm() {
        $formFields.val('');
        makeSubmitBtnNotActive();
    }

    function checkFormValid() {
        if (isFormValid()) {
            makeSubmitBtnActive();
        } else {
            makeSubmitBtnNotActive();
        }
    }

    function isFormValid() {
        var value = true;
        $formFields.each(function() {
            var $fieldValue = $(this);
            value = !!$fieldValue.val();
            return value;
        });
        return value;
    }

    function makeSubmitBtnActive() {
        $submitNewCustomerBtn.removeAttr('disabled');
    }

    function makeSubmitBtnNotActive() {
        $submitNewCustomerBtn.attr('disabled', 'disabled');
    }

    function getCustomerData(id) {
        var promised = request('GET', '/customers/' + id, {});
        fillUpdatedForm(promised);
    }

    function fillUpdatedForm(promised) {
        promised.then(function(data) {
                $customerId.val(data.id);
                $customerName.val(data.name);
                $customerSurname.val(data.surname);
                $manager.val(data.manager);
                checkFormValid();
            });
    }

    function updateCustomer(customer) {
        var $tr = $('[data-id="' + customer.id + '"]');
        var ptomised = request('PUT', '/customers/' + customer.id, customer)
                .then(function (data) {
                    $tr.replaceWith(renderCustomersList(data));
                    loadCustomersList();
        });
    }

    function deleteCustomerFromServer(id) {
        var promised = request('DELETE', '/customers/'+id, {})
                    .then(function() {
                deleteCustomerFromList(id);
            });
    }

    function deleteCustomerFromList(id) {
        var confirmation = confirm('Do you really want to remove this customer?');
        if (confirmation) {
            var $tr = $('[data-id="' + id + '"]');
            $tr.remove();
        }
        loadCustomersList();
    }

 /*   function fillModalWindowForm(data) {
        $('.customerId').val(data.id);
        $('.ordersCount').val(data.ordersCount);
        $('.moneySpent').val(data.moneySpent);
    }

    function openModalWindow() {
        var dialog = $newOrderWindow.dialog({
            autoOpen: false,
            height: 200,
            width: 250,
            modal: true,
            buttons: {
                Save: onAddNewOrderFormSubmit,
                Cancel: function() {
                    dialog.dialog( "close" );
                }
            }
        });
        dialog.dialog('open');
    }


    function onAddNewOrderFormSubmit() {
        getDataFromModalWindowForm()
    }

    function getDataFromModalWindowForm() {
        $('.moneySpent').val(Number($('.moneySpent').val()) + Number($modalFormField.val()));
        $('.ordersCount').val(Number($('.ordersCount').val()) + 1);
    }
    */

});