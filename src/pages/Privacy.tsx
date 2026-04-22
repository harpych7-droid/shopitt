import { LegalPage } from "@/components/legal/LegalPage";

const Privacy = () => (
  <LegalPage title="Privacy Policy" updated="April 2026">
    <section>
      <h3 className="text-base font-extrabold text-foreground">1. What we collect</h3>
      <p className="mt-1">
        Account details (email, handle), commerce data (orders, payouts), device data
        (model, OS, IP) and usage data (taps, scrolls) so we can power the feed.
      </p>
    </section>
    <section>
      <h3 className="text-base font-extrabold text-foreground">2. How we use it</h3>
      <ul className="list-disc pl-5 mt-1 space-y-1">
        <li>To rank drops and personalise your feed.</li>
        <li>To process payments and deliveries.</li>
        <li>To detect fraud and keep accounts safe.</li>
        <li>To send service notifications you opted into.</li>
      </ul>
    </section>
    <section>
      <h3 className="text-base font-extrabold text-foreground">3. Sharing</h3>
      <p className="mt-1">
        We share data only with payment processors, couriers and analytics providers
        we have signed data-processing agreements with. We do not sell personal data.
      </p>
    </section>
    <section>
      <h3 className="text-base font-extrabold text-foreground">4. Your controls</h3>
      <p className="mt-1">
        You can export, edit or delete your data anytime from Menu → Account. Contact
        <a className="text-brand-pink font-bold" href="mailto:shopitt54@gmail.com"> shopitt54@gmail.com</a> for
        any privacy request.
      </p>
    </section>
  </LegalPage>
);

export default Privacy;
