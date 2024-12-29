/** @odoo-module **/
import { useService } from "@web/core/utils/hooks";
import { Component } from "@odoo/owl";
import { Layout } from "@web/search/layout";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";

class AwesomeDashboard extends Component {
    static template = "request_for_quotation.AwesomeDashboard";
    static components = { Layout };

    setup() {
        this.notificationService = useService("notification");
    }

    showNotification() {
        this.notificationService.add(_t("Your changes have been saved successfully."), {
            title: "Success",
            type: "success"
        });
    }
}




registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);