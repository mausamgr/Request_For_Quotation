from odoo import fields, models
from odoo.exceptions import UserError


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    order_deadline = fields.Date(string="Order Deadline")




# class RequestForQuotation(models.Model):
#     _name = 'request_for_quotation'

#     def delete_rfq(self):
#         return {
#             'type': 'ir.actions.act_window',
#             'name': 'Delete Confirmation',
#             'res_model': 'confirm.wizard',
#             'view_mode': 'form',
#             'target': 'new',
#             'context': {
#                 'default_message': 'Are you sure you want to delete this RFQ?',
#                 'default_model_id': self.id,
#             }
#         }