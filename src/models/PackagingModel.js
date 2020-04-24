'use strict';

module.exports = (bookshelf) => {
    
    /**@type {import('bookshelf').Model} */
    const PackagingModel = bookshelf.Model.extend({
        tableName: 'packaging',
        customer: function() {
            return this.belongsTo(RelCustomer,'customer_id')
        },
        supplier: function() {
            return this.belongsTo(RelSupplier,'supplier_id')
        },
        dealer: function() {
            return this.belongsTo(RelDealer,'dealer_id')
        },
    });
    
    let RelCustomer = bookshelf.Model.extend({tableName: 'customers'});
    let RelSupplier = bookshelf.Model.extend({tableName: 'suppliers'});
    let RelDealer = bookshelf.Model.extend({tableName: 'dealers'});

    return PackagingModel;
};