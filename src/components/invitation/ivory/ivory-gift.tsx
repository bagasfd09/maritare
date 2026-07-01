/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */

// Ivory wedding gift — markup ported VERBATIM from the Aulia
// `<section class="wedding-gift-wrap">` (9-gift) and `<section class="kado-wrapper">`
// (10-kado) fragments, folded into one component so the scoped CSS in the ivory
// theme (selectors under `.ivory-inv`) styles it byte-identically. Only the
// data-bearing parts are bound to InvitationView:
//   - one bank card per data.sections.amplop.accounts[] (bank / number / holder),
//     filtered by the viewing guest's family side,
//   - the shipping-address block bound to data.sections.amplop.giftAddress.
// The multi-slide confirmation form (upload proof, selectize, sender data, submit)
// and the accordion/modal JS are dropped → static render; the `<form>` is kept as
// an inert wrapper and the copy buttons are kept as static visuals (no handlers,
// since this is a server component). ewallets are out of scope (no Aulia card for
// them). Returns null when there are no visible accounts AND no giftAddress.

import type { PartySide } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** The viewing guest's family side (from their personalized ?g= link). When
   *  set to groom/bride, only that side's accounts (plus "both") show. Absent or
   *  "both" → show every account (generic link / owner preview). */
  guestSide?: PartySide;
};

// An account shows when the guest has no specific side, or the account is for
// everyone ("both"), or it matches the guest's side.
function visibleForSide(accountSide: PartySide, guestSide?: PartySide): boolean {
  if (!guestSide || guestSide === "both") return true;
  return accountSide === "both" || accountSide === guestSide;
}

export function IvoryGift({ data, guestSide }: Props) {
  const { accounts: allAccounts, giftAddress } = data.sections.amplop;
  const accounts = allAccounts.filter((a) => visibleForSide(a.side, guestSide));
  const hasAddress = !!giftAddress?.trim();

  if (accounts.length === 0 && !hasAddress) {
    return null;
  }

  return (
    <>
      {accounts.length > 0 && (
        <section className="wedding-gift-wrap">
          <div className="ornaments-wrapper">
            <div className="orn-bank-4">
              <div className="image-wrap" data-aos="zoom-out-up" data-aos-duration="2000" data-aos-delay="1200">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-60.png" alt="" />
              </div>
            </div>
            <div className="orn-bank-3">
              <div className="image-wrap" data-aos="zoom-out-up" data-aos-duration="2000" data-aos-delay="1200">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-51.png" alt="" />
              </div>
            </div>
            <div className="orn-bank-2 right">
              <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1900" data-aos-delay="1300">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-07.png" alt="" />
              </div>
            </div>
            <div className="orn-bank-2 left">
              <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1900" data-aos-delay="1300">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-07.png" alt="" />
              </div>
            </div>
            <div className="orn-bank-1 right">
              <div className="orn-bank-1-2">
                <div className="orn-bank-1-2-1">
                  <div className="image-wrap" data-aos="fade-up" data-aos-duration="2200" data-aos-delay="1200">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2000" data-aos-delay="1100">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="" />
                </div>
              </div>
              <div className="orn-bank-1-1">
                <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="1800" data-aos-delay="1000">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-40.png" alt="" />
                </div>
              </div>
              <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1000" data-aos-delay="800">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-63.png" alt="" />
              </div>
            </div>
            <div className="orn-bank-1 left">
              <div className="orn-bank-1-2">
                <div className="orn-bank-1-2-1">
                  <div className="image-wrap" data-aos="fade-up" data-aos-duration="2200" data-aos-delay="1200">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-13.png" alt="" />
                  </div>
                </div>
                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2000" data-aos-delay="1100">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="" />
                </div>
              </div>
              <div className="orn-bank-1-1">
                <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="1800" data-aos-delay="1000">
                  <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-40.png" alt="" />
                </div>
              </div>
              <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1000" data-aos-delay="800">
                <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-63.png" alt="" />
              </div>
            </div>
          </div>
          <div className="wedding-gift-inner">
            <div className="wg-frame">
              <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="650">
                <img loading="lazy" decoding="async" src="/invitation/ivory/frame-quote.png" alt="Quote Frame" />
              </div>
              <div className="ornaments-wrapper">
                <div className="orn-quote-4 right">
                  <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1400" data-aos-delay="1200">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="" />
                  </div>
                </div>
                <div className="orn-quote-4 left">
                  <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1400" data-aos-delay="1200">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="" />
                  </div>
                </div>
                <div className="orn-quote-3 right">
                  <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1400" data-aos-delay="1200">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-16.png" alt="" />
                  </div>
                </div>
                <div className="orn-quote-3 left">
                  <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1400" data-aos-delay="1200">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-16.png" alt="" />
                  </div>
                </div>
              </div>
            </div>

            <div className="wedding-gift-head">
              <h1 className="wedding-gift-title" data-aos="zoom-in" data-aos-duration="1500">
                Wedding Gift
              </h1>
              <p className="wedding-gift-description" data-aos="fade-up" data-aos-duration="1000">
                Your blessing and coming to our wedding are enough for us. However, if you want to give a gift we provide a Digital Envelope to make it easier for you. thank you
              </p>
            </div>

            <div className="wedding-gift-body-wrap" data-aos="fade-up" data-aos-duration="1000">
              <div className="wedding-gift-body">
                <div className="wedding-gift-body-inner">
                  <div className="wedding-gift-form">
                    <form>
                      {/* Details */}
                      <div className="wedding-gift-details wedding-gift__first-slide wedding-gift-slide">
                        {accounts.map((account, i) => (
                          <div className="accor-bank-wrap accor-active" key={i}>
                            <div className="bank-btn-accordion bankBtnAccordion">
                              <p className="bank-btop-txt">
                                {account.bank}
                              </p>
                              <i className="ph-fill ph-control" />
                            </div>
                            <div className="wedding-gift-bank-wrap bankItemAccordion active">
                              <div className="bank-item show">
                                <h3 className="bank-name">{account.bank}</h3>

                                <div className="bank-detail">
                                  <p className="bank-account-number-label">
                                    Account Number:
                                    <span className="bank-account-number">
                                      {account.number}
                                    </span>
                                  </p>
                                  <p className="bank-account-name-label">
                                    Account Name:
                                    <span className="bank-account-name">{account.holder}</span>
                                  </p>
                                  <div className="bank-button-wrap" data-copy={account.number}>
                                    <i className="ph ph-copy-simple" />
                                    <p className="p">Copy</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="ornaments-wrapper">
              </div>
            </div>
          </div>
        </section>
      )}

      {hasAddress && (
        <section className="kado-wrapper">
          <section id="wedding-gifts" className="container wedding-gifts-wrap">
            <div className="wedding-gifts-inner">
              <div className="wedding-gifts-head">
                <div className="orn-gft-header">
                  <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1800" data-aos-delay="1000">
                    <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-ls.png" alt="Orn " />
                  </div>
                </div>
                <h1 className="wedding-gifts-title" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="600">Send us a gift</h1>
                <p className="wedding-gifts-description" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="600">Please send gifts to the bride and groom</p>
              </div>
              <div className="wedding-gifts-body">
                <div className="wedding-gift-address-outer">
                  <div className="ornaments-wrapper">
                    <div className="orn-rd-2">
                      <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1200" data-aos-delay="600">
                        <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-22.png" alt="Ornament" />
                      </div>
                      <div className="orn-rd-2-1">
                        <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1200" data-aos-delay="600">
                          <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-18.png" alt="Ornament" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="wedding-gift-address-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="600">
                    <p className="wedding-gifts-label">Shipping Address</p>
                    <div className="inner-address-wrap">
                      <div className="wedding-gift-info-wrap">
                        <span className="inner-address-info">
                          {giftAddress}
                        </span>
                      </div>
                    </div>

                    <a className="btn-hadiah-copy" data-copy={giftAddress}>
                      <i className="ph ph-copy-simple" />
                      <p className="kado-copy-text">Copy Address</p>
                    </a>
                  </div>
                  <div className="ornaments-wrapper">
                    <div className="orn-rd-1">
                      <div className="orn-rd-1-1">
                        <div className="orn-rd-1-2">
                          <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2000" data-aos-delay="800">
                            <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-12.png" alt="Ornament" />
                          </div>
                        </div>
                        <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="1800" data-aos-delay="600">
                          <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-40.png" alt="Ornament" />
                        </div>
                      </div>
                      <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1200" data-aos-delay="600">
                        <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-17.png" alt="Ornament" />
                      </div>
                    </div>
                    <div className="orn-rd-kp1 kupu-1">
                      <div className="image-wrap" data-aos="zoom-in" data-aos-duration="2000" data-aos-delay="800">
                        <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-1.png" alt="Ornament" />
                      </div>
                    </div>
                    <div className="orn-rd-kp2 kupu-2">
                      <div className="image-wrap" data-aos="zoom-in" data-aos-duration="2000" data-aos-delay="800">
                        <img loading="lazy" decoding="async" src="/invitation/ivory/Orn-kupu-2.png" alt="Ornament" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ornaments-wrapper kado-ow">
                </div>
              </div>
            </div>
          </section>
        </section>
      )}
    </>
  );
}
