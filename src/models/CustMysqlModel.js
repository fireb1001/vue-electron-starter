'use strict';


module.exports = (bookshelf) => {
    
    /**@type {import('bookshelf').Model} */
    const CustomersModel = bookshelf.Model.extend({
        tableName: 'customers',
        soft: ['deleted_at'],
        trans: function() {
            return this.hasMany(RelCustomerTransModel,'customer_id')
        }
    });

    var RelCustomerTransModel = bookshelf.Model.extend({ tableName: 'customer_trans' })
    
    return CustomersModel;
};