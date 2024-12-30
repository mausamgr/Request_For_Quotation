from odoo import fields, models


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'

    order_deadline = fields.Date(string="Order Deadline")