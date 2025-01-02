from odoo import api, fields, models


class ConfirmWizard(models.TransientModel):
    _name = 'confirm.wizard'
    _description = 'Confirmation Wizard'

    message = fields.Text(string='Message', readonly=True)
    model_id = fields.Integer()

