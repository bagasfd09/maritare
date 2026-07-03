// Scarlet theme CSS — ported VERBATIM from the Katsudoto "Anselma & Alvaro"
// template stylesheet (custom-anselma-alvaro.css), with every selector scoped
// under .scarlet-inv and image url()s rewritten to /invitation/scarlet/.
// Injected as a <style> by scarlet-template so it stays route-local.
//
// NOTE: third-party design CSS used at the owner's explicit request. The 3 CSS
// texture images (texture-1/mask-cover/bg-gif) are CDN-only (403) and absent;
// those background layers simply no-op. Replace with own-licensed art before prod.

export const SCARLET_THEME_CSS = String.raw`
.scarlet-inv {
    
    --heading-family: var(--font-pinyon), "Pinyon Script", cursive;
    --heading-style: normal;
    --heading-weight: 400;
    --heading-size: 48px;
    --heading-lettercase: none;

    
    --body-text-family: var(--font-lancelot), "Lancelot", serif;
    --body-text-style: normal;
    --body-text-weight: 400;
    --body-text-size: 16px;
    --body-text-lettercase: none;

    --body-text-family-2: var(--font-cormorant-garamond), "Cormorant Garamond", serif;

    
    --fs-extra-1: 2px;
    --fs-extra-2: 4px;
    --fs-extra-3: 5px;
    --fs-extra-4: 6px;
    --fs-extra-5: 10px;
    --fs-extra-6: 12px;
    --fs-extra-7: 15px;
    --fs-extra-8: 20px;

    
    --body-height: 100vh;
    height: auto;
    overflow: visible;

    
    background-color: var(--background-primary);
}
.scarlet-inv {
    
    --background-primary: #F5F2E4;
    --background-primary-rgb: 245, 242, 228;

    --background-secondary: #700F06;
    --background-secondary-rgb: 112, 15, 6;

    --background-tertiary: #700F06;
    --background-tertiary-rgb: 112, 15, 6;

    
    --text-primary: #700F06;
    --text-primary-rgb: 112, 15, 6;

    --text-secondary: #8A643C;
    --text-secondary-rgb: 138, 100, 60;

    --text-tertiary: #E8E1D1;
    --text-tertiary-rgb: 232, 225, 209;

    
    --button-text-primary: #E8E1D1;
    --button-text-primary-rgb: 232, 225, 209;

    --button-background-primary: #700F06;
    --button-background-primary-rgb: 112, 15, 6;

    --button-text-secondary: #700F06;
    --button-text-secondary-rgb: 112, 15, 6;

    --button-background-secondary: #F5F2E4;
    --button-background-secondary-rgb: 245, 242, 228;

    --button-text-tertiary: #F5F2E4;
    --button-text-tertiary-rgb: 245, 242, 228;

    --button-background-tertiary: #A98534;
    --button-background-tertiary-rgb: 169, 133, 52;

    
    --texture-1: url("/invitation/scarlet/texture-1.webp");
    --bg-gif: url("/invitation/scarlet/bg-gif.gif");
    --cover-frame-mask: url("/invitation/scarlet/mask-cover.webp");

}
@media only screen and (max-width: 960px) {
.scarlet-inv {
        overflow: hidden;
    }
}
@media (max-width: 320px) {
.scarlet-inv {
        --heading-size: 36px;
        --body-text-size: 14px;
    }
}
@media (min-width: 560px) and (max-width: 960px) {
.scarlet-inv {
        --heading-size: 64px;
        --body-text-size: 26px;
    }
}
@media (min-width: 961px) {
.scarlet-inv {
        --heading-size: 52px;
        --body-text-size: 18px;
    }
}
@media (min-width: 1600px) {
.scarlet-inv {
        --heading-size: 64px;
        --body-text-size: 22px;
    }
}
.scarlet-inv h1, .scarlet-inv h2, .scarlet-inv h3, .scarlet-inv h4, .scarlet-inv h5, .scarlet-inv h6 {
    font-family: var(--heading-family);
    font-style: var(--heading-style);
    font-weight: var(--heading-weight);
    font-size: var(--heading-size);
    text-transform: var(--heading-lettercase);
    line-height: normal;
    color: var(--text-primary);
}
.scarlet-inv p {
    font-family: var(--body-text-family);
    font-style: var(--body-text-style);
    font-weight: 400;
    font-size: calc(var(--body-text-size));
    text-transform: var(--body-text-lettercase);
    line-height: normal;
    color: var(--text-secondary);
}
.scarlet-inv span {
    font-family: var(--body-text-family);
    font-size: inherit;
    color: inherit;
    font-weight: 400;
}
.scarlet-inv sup {
    font-family: inherit;
    font-size: 0.5em;
    color: inherit;
    font-family: var(--body-text-family);
}
.scarlet-inv font {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    text-decoration: inherit;
    font-style: inherit;
}
.scarlet-inv img {
    max-width: 100%;
}
.scarlet-inv::-webkit-scrollbar {
    width: 10px;
    height: 15px;
}
.scarlet-inv::-webkit-scrollbar-thumb, .scarlet-inv textarea::-webkit-scrollbar-thumb, .scarlet-inv *::-webkit-scrollbar-thumb {
    border-width: 2px;
    background-color: var(--button-background-primary);
}
.scarlet-inv section.person p {
    font-family: var(--roboto);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.4;
    color: var(--dark-clr);
}
.scarlet-inv .form-control:focus, .scarlet-inv .form-control:active {
    background: var(--light-clr);
    box-shadow: none;
    border-color: var(--button-background-primary);
}
.scarlet-inv .modal-content .mde1 {
    border-bottom: 2px solid rgba(var(--background-primary-rgb), 0.5);
}
.scarlet-inv .modal-content .modal-caption {
    color: var(--text-tertiary);
}
.scarlet-inv .modal-content .btn {
    font-family: var(--body-text-family);
    font-weight: 400;
    font-size: var(--body-text-size);

    background-color: rgba(var(--button-background-secondary-rgb), 1);
    color: var(--button-text-secondary);
}
.scarlet-inv .modal-content .btn:hover {
    background-color: rgba(var(--text-primary-rgb), 1);
    color: var(--button-text-primary);
}
.scarlet-inv .modal-content .btn-wood {
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
}
.scarlet-inv .modal-content .btn-wood:hover {
    background-color: rgba(var(--button-secondary-rgb), 1);
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    flex: 1;
    display: flex;
    flex-direction: column;
    position: absolute;
    
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    justify-content: flex-start;
    align-items: center;
}
.scarlet-inv section.primary-pane .inner .head {
    z-index: 2;
    text-align: center;
    padding-top: 120px;
    margin-bottom: auto;
}
.scarlet-inv section.primary-pane .inner .inner-wrapper {
    position: relative;
    width: 100%;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner h1 {
    padding: 0;
    margin: 0 auto;
    font-size: calc(var(--heading-size));
    color: var(--text-secondary);
    text-align: center;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner p {
    font-size: calc(var(--body-text-size) + var(--fs-extra-2));
    font-style: normal;
    color: var(--text-primary);
    margin: 0 auto;
}
.scarlet-inv section.primary-pane .inner .head-wrap {
    padding-top: 6%;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details {
    
    position: relative;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10% 10%;
    opacity: 0;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details p {
    font-size: var(--body-text-size);
    font-style: normal;
    font-weight: 400;
    text-align: center;
    color: var(--text-primary);
    margin: 0 auto;
    line-height: 150%;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details::before {
    content: "";
    position: absolute;
    bottom: 0;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    background: radial-gradient(85% 50% at 50% 50%, #F8F7F3 0%, rgba(248, 247, 243, 0.60) 50%, rgba(248, 247, 243, 0.00) 100%);
    left: 50%;
    transform: translate(-50%, 0%);
}
.scarlet-inv section.primary-pane .inner .logo-wrap {
    position: relative;
    width: 19.64%;
    margin: 0 auto;
    max-width: 200px;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details .text-wrap {
    width: 130px;
    height: 186px;
    margin: 0 auto;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details .text-wrap h1 {
    padding: 0px 5px;
    margin: -20px auto;
    font-size: calc(var(--heading-size) + var(--fs-extra-8));
    color: var(--text-tertiary);
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details .text-wrap .text-top {
    text-align: left;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details .text-wrap .text-bottom {
    text-align: right;
    margin-right: -16px;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .highlight {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--light-clr);
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .highlight .preview-container {
    width: 100%;
    height: 100%;
    display: block;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .highlight .preview-container .slick-list {
    width: 100% !important;
    height: 100% !important;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .highlight .preview-container .slick-track {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .highlight .preview-container .picture {
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    position: absolute !important;
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .highlight .preview-container .picture img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
}
@media (max-width: 1440px) {
.scarlet-inv section.primary-pane .inner .logo-wrap {
        width: 30.05%;
    }
.scarlet-inv section.primary-pane .inner .head-wrap {
        padding-top: 4%;
    }
}
@media (min-width: 1600px) {
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details p {
        font-size: calc(var(--body-text-size));
    }
.scarlet-inv .kat-page__side-to-side .primary-pane .inner .details {
        padding: 10% 10%;
    }
}
@media (max-width: 1024px) {
.scarlet-inv section.primary-pane .inner .head-wrap {
        margin: auto 0;
    }
}
.scarlet-inv .kat-page__side-to-side {
    min-height: 480px;
    display: block;
    position: relative;
    height: 100%;
    overflow-x: hidden;
}
.scarlet-inv .kat-page__side-to-side, .scarlet-inv .kat-page__side-to-side * {
    
    -webkit-overflow-scrolling: auto;
}
.scarlet-inv .kat-page__side-to-side .primary-pane {
    overflow: hidden;
    top: 0;
    left: 0;
    bottom: 0;
    position: fixed;
    width: 61%;

    background-color: var(--background-primary);
}
.scarlet-inv .kat-page__side-to-side .secondary-pane {
    position: static;
    right: 0;
    width: 39%;
    margin-left: auto;
    background-color: var(--background-primary);
}
.scarlet-inv .kat-page__side-to-side .secondary-pane::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: var(--texture-1);
    background-repeat: repeat;
    background-size: 100% auto;
    opacity: 0.4;
}
@media only screen and (min-width: 960px) and (max-width: 1400px) {
.scarlet-inv .kat-page__side-to-side .secondary-pane section.video-gallery .inner .video-outer .video {
        width: 100%;
    }
}
@media only screen and (max-width: 960px) {
.scarlet-inv .kat-page__side-to-side .primary-pane {
        position: relative;
        width: 100%;
        display: none;
    }
.scarlet-inv .kat-page__side-to-side .secondary-pane {
        position: relative;
        width: 100%;
    }
}
.scarlet-inv .ornaments-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}
.scarlet-inv .image-wrap {
    position: relative;
    width: 100%;
}
.scarlet-inv .image-wrap img {
    width: 100%;
    height: auto;
    max-width: 100%;
}
.scarlet-inv .p-relative {
    position: relative;
}
.scarlet-inv .no-scrollbar::-webkit-scrollbar {
    display: none;
}
.scarlet-inv .no-scrollbar {
    -ms-overflow-style: none;
    
    scrollbar-width: none;
    
}
.scarlet-inv .penanda {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: var(--body-text-family);
    font-size: 52px;
    color: var(--text-primary);
}
.scarlet-inv section.top-cover {
    background-color: var(--background-primary);
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: var(--body-height);
    z-index: 999999;
    top: 0;
    
    left: 0;
    padding: 0;

    transition: all 1.8s;
    transition-timing-function: cubic-bezier(0.23, 0.56, 0.38, 0.78);
    -webkit-transition-timing-function: cubic-bezier(0.23, 0.56, 0.38, 0.78);
    -moz-transition-timing-function: cubic-bezier(0.23, 0.56, 0.38, 0.78);
    -o-transition-timing-function: cubic-bezier(0.23, 0.56, 0.38, 0.78);

    display: flex;
    flex-direction: column;
    display: none;
}
@media only screen and (max-width: 960px) {
.scarlet-inv section.top-cover {
        display: flex;
    }
}
.scarlet-inv section.top-cover.hide {
    top: -120%;
    bottom: 120%;
    pointer-events: none;
}
.scarlet-inv section.top-cover .inner {
    
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    position: relative;
}
.scarlet-inv section.top-cover .prime-title {
    color: var(--text-secondary);
    font-size: calc(var(--heading-size) - 8px);
}
.scarlet-inv section.top-cover .inner .head {
    z-index: 2;
    text-align: center;
    padding-top: 120px;
    margin-bottom: auto;
}
.scarlet-inv section.top-cover .inner .head h1 {
    font-size: calc(var(--heading-size));
    padding: 0px;
    margin: 0px auto;
    color: var(--text-quartiary);
}
.scarlet-inv section.top-cover .inner .head p {
    margin-bottom: 4px;
}
.scarlet-inv .orn-front {
    z-index: 3;
}
.scarlet-inv section.top-cover .inner .details {
    text-align: center;
    padding: 11.8% 24px 27.8%;
    
    position: relative;
    
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    
}
.scarlet-inv section.top-cover .inner .details::before {
    content: "";
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(50% 50% at 50% 50%, #E8E1D1 0%, rgba(232, 225, 209, 0.50) 77.4%, rgba(232, 225, 209, 0.00) 100%);
    margin: 0 auto;
}
.scarlet-inv .orn-tc-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding-top: 6.3%;
}
.scarlet-inv section.top-cover .inner .details p {
    text-align: center;
    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    color: var(--text-primary);
}
.scarlet-inv section.top-cover .cover-free-text {
    font-family: var(--body-text-family);
    font-weight: var(--body-text-weight);
    font-style: var(--body-text-style);
    font-size: var(--body-text-size);
    text-transform: var(--body-text-lettercase);
    color: var(--text-secondary);
}
.scarlet-inv section.top-cover .inner .details .link-wrap {
    margin-top: 8px;
    display: flex;
    justify-content: center;
}
.scarlet-inv section.top-cover .inner .details a.link {
    border: none;
    outline: none;
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
    font-size: var(--body-text-size);
    font-weight: 400;
    font-family: var(--body-text-family);
    line-height: 1.5;
    text-decoration: none;
    margin: 0px auto;
    padding: 12px 16px;
    border-radius: 12px;
    transition: all 0.25s ease-in-out;
    cursor: pointer;
}
.scarlet-inv section.top-cover .inner .details a.link:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), 1);
}
.scarlet-inv section.top-cover .inner .highlight {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--background-primary);
}
.scarlet-inv section.top-cover .inner .highlight .preview-container {
    width: 100%;
    height: 100%;
    display: block;
}
.scarlet-inv section.top-cover .inner .highlight .preview-container .slick-list {
    width: 100% !important;
    height: 100% !important;
}
.scarlet-inv section.top-cover .inner .highlight .preview-container .slick-track {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
}
.scarlet-inv section.top-cover .inner .highlight .preview-container .picture {
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    position: absolute !important;
}
.scarlet-inv section.top-cover .inner .highlight .preview-container .picture img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
}
.scarlet-inv section.top-cover .inner .logo-wrap {
    position: relative;
    
    width: 32.75%;
    margin: 0 auto;
    max-width: 220px;
    z-index: 3;
}
@media (min-width: 560px) {
.scarlet-inv section.top-cover .inner {}
}
@media (min-width: 560px) and (max-width: 960px) {
.scarlet-inv section.top-cover .inner .details {
        padding: 24.8% 24px 24.8%;
    }
}
.scarlet-inv section.cover {
    
    position: relative;
    overflow: hidden;
    padding-bottom: 5%;
    display: flex;
    flex-direction: column;
}
.scarlet-inv .bg-cover {
    position: absolute;
    width: 145%;
    left: 50%;
    transform: translate(-50%, 0%);
    top: 0;
    opacity: .5;
}
.scarlet-inv .cover-mask {
    position: absolute;
    width: 100%;
    height: 30%;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
    background: linear-gradient(180deg, rgba(245, 242, 228, 0.00) 0%, #F5F2E4 100%);
}
.scarlet-inv section.cover .inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    position: relative;
    
}
.scarlet-inv section.cover .inner .head {
    text-align: center;
    padding: 30% 24px 0px;
    position: relative;
    z-index: 5;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.scarlet-inv section.cover .inner .head h1 {
    padding: 0;
    font-size: calc(var(--heading-size));
    line-height: normal;
    font-weight: 400;
    font-family: var(--heading-family);
    color: var(--text-primary);
    line-height: 100%;
    
}
.scarlet-inv section.cover .inner .head p {
    
}
.scarlet-inv section.cover .inner .head p.date {
    margin-top: 10px;
}
.scarlet-inv section.cover .inner .body {
    padding: 0px 58px;
    margin: 20px auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.scarlet-inv section.cover .inner .body.highlight.no_mobile {
    display: none;
}
.scarlet-inv section.cover .inner .body .cover-frame {
    position: absolute;
    inset: 0% 0%;
    background: var(--secondary-clr);
    /* mask-cover.png (CDN texture) is unavailable; a failed mask hides the whole
       frame (incl. the photo). Approximate the arch shape with border-radius +
       overflow instead, so the cover photo always renders. */
    border-radius: 50% 50% 5% 5% / 34% 34% 3% 3%;
    overflow: hidden;
    top: 1%;
    left: 2%;
    bottom: 2%;
    right: 2%;
}
.scarlet-inv section.cover .inner .body .cover-picture {
    position: absolute;
    inset: 0 0 0 0;
}
.scarlet-inv section.cover .inner .body .cover-picture .slick-list {
    width: 100% !important;
    height: 100% !important;
}
.scarlet-inv section.cover .inner .body .cover-picture .slick-track {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
}
.scarlet-inv section.cover .inner .body .cover-picture .picture {
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    position: absolute !important;
    background-color: var(--secondary-clr);
}
.scarlet-inv section.cover .inner .body .cover-picture .picture img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
}
.scarlet-inv .cover .orn-cover-frame {
    position: relative;
    
    width: calc(100% - 0px);
    max-width: 550px;
    
}
@media (min-width: 700px) {
.scarlet-inv section.cover .inner .head {
        gap: 12px;
    }
}
@media (min-width: 961px) {
.scarlet-inv section.cover .inner .body.highlight.no_desktop {
        display: none;
    }
}
@media (min-width: 560px) and (max-width: 960px) {
.scarlet-inv section.cover .inner .head {
        gap: 12px;
    }
}
.scarlet-inv section.cover .inner .foot {
    width: 100%;
    text-align: center;
    padding: 20px 10px;
    position: relative;
}
.scarlet-inv section.cover .inner .foot p {
    color: var(--text-primary);
    font-size: calc(var(--body-text-size));
    font-weight: 500;
}
.scarlet-inv section.cover .inner .foot .prime-title {}
.scarlet-inv .couple-wrap {
    position: relative;
    overflow: hidden;
    padding: 12% 0 3%;
}
.scarlet-inv .cp-mask {
    position: absolute;
    width: 100%;
    height: 30%;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    background: linear-gradient(0deg, rgba(245, 242, 228, 0.00) 0%, #F5F2E4 100%);
}
.scarlet-inv .couple-wrap .couple {
    padding: 0% 0px 5%;
}
.scarlet-inv .couple-head {
    text-align: center;
    padding: 0% 10.3% 7%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 650px;
    margin: auto;
}
.scarlet-inv .couple-head .couple-title {
    font-size: calc(var(--heading-size));
    font-weight: 400;
    overflow-wrap: break-word;
}
.scarlet-inv .couple-head .couple-description {
    font-size: calc(var(--body-text-size));
    color: var(--text-secondary);
    line-height: 150%;
    overflow-wrap: break-word;
}
.scarlet-inv .couple-head+.couple-body {
    margin-top: 10%;
}
.scarlet-inv .couple-body {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
}
.scarlet-inv .couple-body.bride-first {
    flex-direction: column-reverse;
}
.scarlet-inv .couple-info.bride {}
.scarlet-inv .couple-info {
    width: 100%;
    position: relative;
}
.scarlet-inv .couple-preview {
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: 5%;
}
.scarlet-inv .couple-small-details {
    text-align: right;
}
.scarlet-inv .couple-small-details.bride {
    text-align: left;
}
.scarlet-inv .couple-small-details p {}
.scarlet-inv .couple-info.groom .couple-small-details .nick-name {}
.scarlet-inv .couple-preview .img-wrap {
    position: relative;
    display: inline-block;
    vertical-align: top;
    width: 100%;
}
.scarlet-inv .couple-info.groom .couple-preview {
    
}
.scarlet-inv .couple-info.bride .couple-preview {
    
}
.scarlet-inv .couple-info.groom .couple-preview.wide-margin {
    margin-top: -20px;
}
.scarlet-inv .couple-info.bride .couple-preview.wide-margin {
    margin-top: -30px;
}
.scarlet-inv .couple-frame {
    position: relative;
    width: 100%;
    transform: scaleX(-1);
    padding-bottom: 12%;
}
.scarlet-inv .couple-info.bride .couple-frame {
    margin-left: auto;
    transform: scaleX(-1);
    width: 100%;
}
.scarlet-inv .couple-info.groom .couple-frame {
    margin-right: auto;
}
.scarlet-inv .couple-info.groom .couple-picture-wrap {
    position: relative;
    width: 60%;
    height: auto;
    margin-left: auto;
}
.scarlet-inv .couple-info.bride .couple-picture-wrap {
    position: relative;
    width: 60%;
    height: auto;
}
.scarlet-inv .couple-picture {
    display: flex;
    width: 100%;
    position: relative;
    max-width: 600px;
    margin: 0 auto;
}
.scarlet-inv .couple-info.bride .couple-picture {
    position: relative;
}
.scarlet-inv .couple-info.groom .couple-picture {}
.scarlet-inv .couple-info.groom .couple-picture .img {
    width: 73.84%;
    transform: translate(-50%, 0%) scaleX(-1);
    left: 50%;
}
.scarlet-inv .couple-picture .img {
    width: 70%;
    object-fit: contain;
    position: relative;
}
.scarlet-inv .couple-info.bride .couple-picture .img {
    width: 72.564%;
    transform: translate(-50%, 0px) scaleX(-1);
    left: 50%;
}
.scarlet-inv .couple-details {
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 0 6.2%;
    position: relative;
    z-index: 1;
}
.scarlet-inv .couple-details.top {
    margin-bottom: 10%;
}
.scarlet-inv .cp-top {
    position: relative;
    width: clamp(200px, 51.28%, 300px);
    margin: 0 auto;
}
.scarlet-inv .agenda-wrap .cp-top {
    width: 100%;
    max-width: 300px;
}
.scarlet-inv .groom .couple-details .couple-name {}
.scarlet-inv .couple-details .couple-name-big {
    font-size: calc(var(--heading-size) + 14px);
    color: var(--text-primary);
    line-height: normal;
    padding: 0 6%;
}
.scarlet-inv .couple-details .couple-name {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size) + 12px);
    color: var(--text-primary);
    line-height: 140%;
    font-weight: 400;
}
.scarlet-inv .couple-details .couple-parents {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    line-height: 142%;
}
.scarlet-inv .couple-details .couple-bio {
    font-size: calc(var(--body-text-size));
}
.scarlet-inv .couple-link-wrap {
    display: flex;
    justify-content: flex-start;
}
.scarlet-inv .couple-link {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration: none;
    transition: all 0.25s ease-in-out;
    padding: 8px 12px;
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
    border-radius: 12px;
    font-style: italic;
}
.scarlet-inv .couple-link:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), 1);
    color: var(--button-text-tertiary);
}
.scarlet-inv .separator-wrap {
    width: 100%;
    position: relative;
    padding: 0px;
    
    margin: 15% auto 15%;
}
.scarlet-inv .separator-wrap .separator {
    display: flex;
}
.scarlet-inv .separator-wrap .separator .couple-separator {
    font-family: var(--body-text-family);
    font-size: calc(var(--heading-size));
    line-height: normal;
    margin: auto;
    color: var(--text-primary);
}
@media (min-width: 600px) and (max-width: 960px) {
.scarlet-inv .couple-wrap .couple {
        padding: 0% 0px 8%;
    }
.scarlet-inv .couple-wrap {
        padding: 7% 0 3%;
    }
}
@media (min-width: 1400px) {
.scarlet-inv .couple-wrap {
        padding: 5% 0 3%;
    }
}
.scarlet-inv .photo-wrap {
    position: relative;
    overflow: hidden;
    padding: 30% 0 5%;
}
.scarlet-inv .photo-wrap .photo-inner {
    position: relative;
}
.scarlet-inv .photo-inner .photo-head {
    text-align: center;
    padding: 20px 17%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.scarlet-inv .photo-head .photo-title {
    font-family: var(--heading-family);
    font-size: calc(var(--heading-size));

    color: var(--text-primary);
}
.scarlet-inv .photo-head .photo-caption {
    font-family: var(--body-text-family);
    
    font-size: var(--body-text-size);
}
.scarlet-inv .photo-inner .photo-body {
    
    margin: 0 auto;
}
.scarlet-inv .photo-body .photo-nav-wrap {
    position: relative;
    padding: 0px;

    width: 75%;
    max-width: 420px;
    margin: 0 auto 5%;
}
.scarlet-inv .photo-nav-wrap .photo-nav {
    position: relative;
}
.scarlet-inv .photo-nav .slick-list {
    padding: 4% 0 5%;
}
.scarlet-inv .photo-nav .photo-item {}
.scarlet-inv .photo-nav .photo-item .preview-wrap {
    position: relative;
    margin: 0 auto;
}
.scarlet-inv .photo-nav .photo-img-wrap {
    position: relative;
    width: 100%;
    height: 100%;
}
.scarlet-inv .photo-nav .photo-img {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    display: block;
    object-fit: cover;
    object-position: center;
}
.scarlet-inv .photo-body .photo-slider-wrap {
    position: relative;
}
.scarlet-inv .photo-slider-wrap .photo-slider {
    position: relative;
}
.scarlet-inv .photo-slider .slick-list {}
.scarlet-inv .photo-slider .photo-item {
    padding: 0px 4px;
}
.scarlet-inv .photo-slider .photo-img-wrap {
    width: auto;
    height: 80px;
}
.scarlet-inv .photo-slider .photo-img {
    width: auto;
    min-width: 110px;
    height: 100%;
    border-radius: 4px;
    display: block;
    object-fit: cover;
    object-position: center;
}
.scarlet-inv .photo-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background-color: transparent;
    padding: 10px;
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.25s ease-in-out;
}
.scarlet-inv .photo-arrow:hover {
    opacity: 1;
}
.scarlet-inv .photo-arrow.prev {
    left: 10px;
}
.scarlet-inv .photo-arrow.next {
    right: 10px;
}
.scarlet-inv .photo-arrow.slick-disabled {
    display: none !important;
}
.scarlet-inv .photo-arrow svg {
    width: 12px;
    height: auto;
    display: block;
}
.scarlet-inv .photo-arrow svg path {
    stroke: var(--text-secondary);
}
.scarlet-inv .photo-link {}
.scarlet-inv .photo-item:nth-child(even) img {
    min-width: unset;
}
@media (min-width : 561px) and (max-width: 960px) {
.scarlet-inv .photo-slider .photo-img-wrap {
        width: auto;
        height: 150px;
    }
.scarlet-inv .photo-slider .photo-img {
        min-width: 200px;
    }
}
@media (min-width : 961px) {
.scarlet-inv .photo-slider .photo-img-wrap {
        width: auto;
        height: 150px;
    }
.scarlet-inv .photo-slider .photo-img {
        min-width: 200px;
    }
}
.scarlet-inv section.video-gallery {
    background-color: transparent;
    padding: 0px 0px;
    position: relative;
    overflow: hidden;
    z-index: 3;
}
.scarlet-inv section.video-gallery .inner {
    padding: 0px;
}
.scarlet-inv section.video-gallery .inner>.title {
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}
.scarlet-inv section.video-gallery .inner>.title h1 {
    padding: 0;
    margin-bottom: auto;
    font-family: var(--heading-family);
    font-size: var(--heading-size);
}
.scarlet-inv section.video-gallery .inner>.title p {
    font-size: var(--body-text-size);
}
.scarlet-inv section.video-gallery .inner .video-outer {
    position: relative;
    width: 100%;
    padding: 0px;
    flex-direction: column;
}
.scarlet-inv section.video-gallery .inner .video-outer .video {
    position: relative;
    width: calc(100% - 90px);
    max-width: 500px;
    margin: 0px auto 5%;
    padding: 0px;
}
.scarlet-inv section.video-gallery .inner .video-outer .video p {
    font-size: calc(var(--body-text-size) + 4px);
    color: var(--text-primary);
}
.scarlet-inv section.video-gallery .inner .video-outer .video-inner {
    position: relative;
    margin: 0 auto;
    text-align: center;
}
.scarlet-inv section.video-gallery .inner .video-outer .video:first-of-type {
    margin-top: 0px;
}
.scarlet-inv section.video-gallery .inner .video-outer .video:last-of-type {
    margin-bottom: 0;
}
.scarlet-inv section.video-gallery .inner .video-outer .video .preview {
    border-radius: 0px;
    width: 100%;
    height: auto;
    margin-bottom: 12px;
}
.scarlet-inv section.video-gallery .inner .video-outer .video .preview img {
    border-radius: 0px;
    width: 100%;
    height: 100%;
}
.scarlet-inv section.video-gallery .inner .video-outer .video-inner>.title {
    padding: 0px;
}
.scarlet-inv section.video-gallery .inner .video-outer .video-inner>.title>p {
    color: var(--text-primary);
}
.scarlet-inv section.live-streaming {
    padding: 5% 40px 8%;
    position: relative;
    overflow: hidden;
}
.scarlet-inv section.live-streaming .inner {
    padding: 0px;
    max-width: 540px;
}
.scarlet-inv section.live-streaming .inner .head {
    text-align: center;
    padding: 0px;
    margin-bottom: 8%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.scarlet-inv section.live-streaming .inner .head h1 {
    padding: 0px;
    margin-bottom: 0px;
    font-size: var(--heading-size);
}
.scarlet-inv section.live-streaming .inner .head p {
    font-size: var(--body-text-size);
    color: var(--text-secondary);
    line-height: 150%;
    font-size: var(--body-text-size);
    font-style: normal;
}
.scarlet-inv .live-streaming .inner .body {
    position: relative;
    padding: 0;
}
.scarlet-inv .live-streaming .inner .body p {
    font-size: var(--body-text-size);
    color: var(--text-secondary);
    text-align: center;
    padding-top: 16px;
}
.scarlet-inv .live-streaming .inner .body p.meeting-text {
    font-family: var(--body-text-family);
    font-weight: 500;
    font-size: calc(var(--body-text-size) + var(--fs-extra-1));
}
.scarlet-inv .live-streaming .inner .body>.streaming-info {
    padding: 16px;
    border-radius: 16px;
    background: var(--background-secondary);
    box-shadow: 4px 1px 4px 0px rgba(97, 97, 97, 0.15);
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div {
    padding: 0px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div.zoom-details {
    padding: 0px 24px;
    flex-wrap: nowrap;
    gap: 10px;
    margin-top: 24px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div.zoom-details>div {
    margin: 0;
    flex-grow: 1;
    width: 100%;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview {
    width: 70px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.google-meet {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--background-secondary);
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.google-meet>img {
    width: 62.5%;
    height: auto;
    border-radius: 0px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview, .scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview>img {
    border-radius: 0px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.wide {

    height: 200px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.wide>img {
    object-fit: cover;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.wide.youtube {
    height: 200px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview>.play-btn {
    width: 70px;
    height: 70px;
    font-size: 30px;
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div.link {
    margin-top: 10px;
    display: flex;
    justify-content: center;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div.link>a {
    border: none;
    outline: none;
    box-shadow: none;
    width: 100%;

    font-family: var(--body-text-family);
    font-weight: 400;
    font-size: var(--body-text-size);

    background-color: var(--button-background-secondary);
    border: none;
    color: var(--button-text-secondary);

    border-radius: 12px;
    padding: 12px 16px;
}
.scarlet-inv .live-streaming .inner .body>.streaming-info>div.link>a:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), .8);
    color: var(--button-text-tertiary);
}
@media (min-width: 768px) and (max-width: 960px) {
.scarlet-inv section.live-streaming {
        
        padding-bottom: 7%;
    }
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.wide {
        height: 320px;
    }
}
@media (min-width: 425px) {
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.wide.youtube {
        height: 360px;
    }
}
@media (min-width: 1200px) {
.scarlet-inv .live-streaming .inner .body>.streaming-info>div>.preview.wide {
        height: 320px;
    }
}
.scarlet-inv .save-date-wrap {
    position: relative;
    overflow: hidden;
    padding: 5% 17px 5%;
    margin: 0 auto;
    
}
.scarlet-inv .save-date-wrap .save-date-frame {
    position: relative;
    width: 100%;
    max-width: 600px;
    height: auto;
    margin: 0 auto 12%;
}
.scarlet-inv .save-date-wrap .save-date {
    width: 70%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -48%);
    max-width: 280px;
    margin: 0px auto;
    padding: 20px 0px;
    position: absolute;
    z-index: 1;
}
.scarlet-inv .save-date-head {
    padding: 5% 0px 0;
    text-align: center;
    position: relative;
    max-width: 600px;
    margin: 0 auto;
}
.scarlet-inv .save-date-wrap .save-date-title {
    text-align: center;
    
    padding: 0 5%;
}
.scarlet-inv .save-date-head .save-date-event {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    color: var(--text-primary);
    margin-top: 5px;
    letter-spacing: 3px;
}
.scarlet-inv .save-date-body {
    position: relative;
}
.scarlet-inv .countdown {
    padding: 0px 0px 10px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0px;
}
.scarlet-inv .countdown .count-item {
    text-align: center;
    padding: 8px;
    width: 90px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.scarlet-inv .save-date .save-date-body .count-item .count-num {
    font-size: calc(var(--heading-size) - 8px);
    font-style: normal;
    font-family: var(--body-text-family);
}
.scarlet-inv .count-item .count-text {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    font-style: normal;
    color: var(--text-secondary);
}
.scarlet-inv .add-to-calendar-wrap {
    display: flex;
    flex-direction: column;
    
    margin-top: 10px;
}
.scarlet-inv .add-to-calendar {
    padding: 12px 24px;
    margin: 0px auto;
    border-radius: 12px;
    min-width: 150px;
    display: inline-block;
    vertical-align: top;
    text-align: center;
    text-decoration: none;
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size) + 0px);
    font-weight: 400;
    background-color: var(--button-background-primary);
    border: none;
    color: var(--button-text-primary);
    transition: all 0.25s ease-in-out;
}
.scarlet-inv .add-to-calendar:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), 1);
    color: var(--button-text-tertiary);
}
@media (max-width: 320px) {
.scarlet-inv .countdown .count-item {
        width: 67px;
    }
}
@media (min-width: 700px) and (max-width: 961px) {
.scarlet-inv .countdown .count-item {
        width: 95px;
    }
}
@media (min-width: 1440px) {
.scarlet-inv .save-date-wrap .save-date {
        
    }
.scarlet-inv .countdown .count-item {
        width: 95px;
    }
}
.scarlet-inv .agenda-wrap {
    position: relative;
    overflow: hidden;
    padding: 9% 0px 5%;
}
.scarlet-inv .agenda-inner {
    padding: 0 0 0%;
}
.scarlet-inv .agenda-head {
    position: relative;
    padding: 0px 24px 40px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.scarlet-inv .orn-agenda-top {
    position: relative;
    margin: 0 auto;
    width: clamp(121px, 31%, 150px);
}
.scarlet-inv .agenda-head .agenda-title {
    font-size: calc(var(--heading-size) + 0px);
}
.scarlet-inv .agenda-head .agenda-description {
    margin: 0 auto;
    color: var(--text-secondary);
    max-width: 400px;
    line-height: 171%;
    font-size: calc(var(--body-text-size) - 2px);
}
.scarlet-inv .agenda-body {
    position: relative;
    z-index: 1;
    margin-top: 12%;
}
.scarlet-inv .event-item {
    position: relative;
    text-align: center;
    margin-top: 27%;
}
.scarlet-inv .event-item:first-of-type {
    margin-top: 0px;
}
.scarlet-inv .event-head {
    width: 100%;
    padding: 0px 24px 11%;
    text-align: center;
    position: relative;
}
.scarlet-inv .event-head-wrapper {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.scarlet-inv .event-head-wrapper .event-day {
    font-family: var(--body-text-family);
    color: var(--text-tertiary);
    font-size: calc(var(--heading-size) - 16px);
}
.scarlet-inv .event-head .divider {
    position: relative;
    
    width: 1px;
    min-height: 44px;
    height: 100%;
    background-color: var(--button-background-primary);
}
.scarlet-inv .event-head .event-date {
    display: flex;
    gap: 24px;
}
.scarlet-inv .event-head .event-date .item-side {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-end;
}
.scarlet-inv .event-head .event-date .item-side.right {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: flex-start;
}
.scarlet-inv .event-head .event-date .item-mid {
    display: flex;
    align-items: center;
    justify-content: center;
}
.scarlet-inv .event-head .event-date .item-side p {
    flex: 1;
    color: var(--text-primary);
    font-family: var(--body-text-family);
    font-size: calc(var(--heading-size) - 16px);
    font-style: normal;
    text-align: end;
    font-weight: 400;
    line-height: 171%;
    
}
.scarlet-inv .event-head .event-date .item-side.right p {
    text-align: start;
}
.scarlet-inv .event-head .event-date .item-mid p {
    color: var(--text-tertiary);
    font-size: calc(var(--heading-size) - 16px);
    font-family: var(--body-text-family);
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    
}
.scarlet-inv .event-head .event-description {
    margin-top: 10px;
    color: var(--text-secondary);
}
.scarlet-inv .activity-wrap {
    padding: 0 0px 5%;
}
.scarlet-inv .activity-wrap.same-location {}
.scarlet-inv .activity-item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    
    margin-top: 15%;
    z-index: 1;
}
.scarlet-inv .activity-item:first-child {
    z-index: 2;
    padding-top: 0;
    margin-top: 0px;
}
.scarlet-inv .activity-frame {
    position: relative;
    width: calc(100%);
    max-width: 600px;
    left: 50%;
    transform: translateX(-50%);
}
.scarlet-inv .activity-frame .frame-wrap {}
.scarlet-inv .activity-frame .frame-wrap img {
    display: block;
    width: 100%;
    height: auto;
    margin: auto;
}
.scarlet-inv .activity-item:nth-child(odd) .activity-frame .frame-wrap img {
    margin-top: 0px;
}
.scarlet-inv .activity-item:nth-child(even) .activity-frame {
    
}
.scarlet-inv .activity-item:nth-child(even) .activity-frame {
    transform: translateX(-50%) scaleX(-1);
}
.scarlet-inv .activity-content {
    position: absolute;
    bottom: 10%;
    left: 50%;
    width: calc(67%);
    max-width: 400px;
    max-height: 65%;
    transform: translate(-50%, 0%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
}
.scarlet-inv .activity-item:nth-child(even) .activity-content {}
.scarlet-inv .activity-content::-webkit-scrollbar {
    display: none;
}
.scarlet-inv .activity-head {
    text-align: center;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0px 25px;
}
.scarlet-inv .activity-head .activity-icon {
    width: 60px;
    height: 60px;
    display: block;
    object-fit: contain;
    object-position: center;
    margin: 0 auto;
}
.scarlet-inv .activity-title-wrap {}
.scarlet-inv .activity-head .activity-title {
    font-family: var(--heading-family);
    font-size: calc(var(--heading-size) - 12px);
    
}
.scarlet-inv .activity-head .ev-day {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size) + 4px);
}
.scarlet-inv .activity-details .activity-description {
    font-size: calc(var(--body-text-size) - 2px);
    font-weight: 500;
    color: var(--text-secondary);
    line-height: 142%;
    font-family: var(--body-text-family-2);
    font-style: italic;
}
.scarlet-inv .activity-head .activity-caption {
    font-size: calc(var(--body-text-size) - var(--fs-extra-2));
    font-weight: 500;
    margin-bottom: 0.25em;
    color: var(--text-primary);
}
.scarlet-inv .activity-content .activity-time {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    font-weight: 700;
    font-style: normal;
    color: var(--text-primary);
}
.scarlet-inv .activity-head svg.activity-icon path {
    fill: var(--text-primary);
}
.scarlet-inv .event-details, .scarlet-inv .activity-details {
    padding: 0 30px;
    text-align: center;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.scarlet-inv .event-details .event-hall, .scarlet-inv .activity-details .activity-hall {
    color: var(--text-primary);
    text-align: center;
    font-size: calc(var(--body-text-size));
    font-style: normal;
    font-weight: 700;
    font-family: var(--body-text-family-2);
    padding: 0 19%;
}
.scarlet-inv .ev-1 .event-details .event-hall, .scarlet-inv .ev-1 .activity-details .activity-hall {
    padding: 0 10%;
}
.scarlet-inv .event-details .event-address, .scarlet-inv .activity-details .activity-address {
    margin: 0 auto;
    max-width: 720px;
    font-size: calc(var(--body-text-size) - 2px);
    font-style: normal;
    font-weight: 500;
    color: var(--text-secondary);
    font-style: italic;
    line-height: 142%;
    font-family: var(--body-text-family-2);
}
.scarlet-inv .event-details .event-city, .scarlet-inv .activity-details .activity-city {
    font-size: calc(var(--body-text-size) - 2px);
    font-style: normal;
    font-weight: 500;
    color: var(--text-secondary);
    font-style: italic;
    line-height: 142%;
    font-family: var(--body-text-family-2);
}
.scarlet-inv .event-link-wrap, .scarlet-inv .activity-link-wrap {
    text-align: center;
}
.scarlet-inv .event-link, .scarlet-inv .activity-link {
    display: inline-block;
    vertical-align: top;
    font-family: var(--body-text-family-2);
    font-weight: 500;
    font-size: var(--body-text-size);
    padding: 12px 16px;
    border-radius: 0px;
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
    text-decoration: none;
    border-radius: 12px;
    transition: all 0.25s ease-in-out;
    width: 100%;
}
.scarlet-inv .event-link:hover, .scarlet-inv .activity-item .activity-link:hover {
    background-color: var(--button-background-tertiary);
    color: var(--button-text-tertiary);
}
@media (min-width: 700px) and (max-width: 961px) {
.scarlet-inv .activity-content {}
.scarlet-inv .event-details, .scarlet-inv .activity-details {
        padding: 0 35px;
    }
.scarlet-inv .event-head .divider {
        min-height: 72px;
    }
.scarlet-inv .activity-head .activity-icon {
        width: 120px;
        height: 120px;
    }
.scarlet-inv .event-head-wrapper .event-day {
        
    }
.scarlet-inv .agenda-wrap {
        padding-top: 7%;
    }
.scarlet-inv .agenda-body {
        margin-top: 9%;
    }
}
@media (min-width: 1400px) {
.scarlet-inv .activity-content {
        margin-top: 0;
        
    }
.scarlet-inv .event-details, .scarlet-inv .activity-details {
        padding: 0 35px;
    }
.scarlet-inv .event-head .divider {
        min-height: 72px;
    }
}
@media (min-width: 1600px) {
.scarlet-inv .activity-head .activity-icon {
        width: 120px;
        height: 120px;
    }
.scarlet-inv .event-head .divider {
        min-height: 66px;
    }
}
.scarlet-inv .rsvp-wrap {
    position: relative;
    overflow: hidden;
    padding: 0% 0px 10%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.scarlet-inv .rsvp-inner {
    position: relative;
    padding: 5% 10.25% 0;
}
.scarlet-inv .rsvp-head {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
}
.scarlet-inv .orn-rsvp-top {
    position: relative;
    margin: 0 auto;
    width: clamp(160px, 41%, 200px);
}
.scarlet-inv .rsvp-head .rsvp-title {
    font-family: var(--heading-family);
    font-size: calc(var(--heading-size) + 0px);
    text-align: center;
}
.scarlet-inv .rsvp-head .rsvp-desc-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;

    padding: 12px 0;
    text-align: center;
}
.scarlet-inv .rsvp-head .rsvp-desc {}
.scarlet-inv .rsvp-head .rsvp-desc-2 {
    color: var(--text-primary);
    font-size: calc(var(--body-text-size) + 2px);
    font-weight: 600;
}
.scarlet-inv .rsvp-body-wrapper {
    max-width: 500px;
    position: relative;
    margin: 0 auto;
    
    display: flex;
    flex-direction: column;
    gap: 12px;
    

    border-radius: 24px;
}
.scarlet-inv .rsvp-body {
    position: relative;
    width: 100%;
}
.scarlet-inv .rsvp-session-wrap {
    margin: 0px auto 24px;
    gap: 12px;
}
.scarlet-inv .rsvp-status-wrap {
    margin: 0px auto 16px;
}
.scarlet-inv .rsvp-status-head {
    text-align: center;
}
.scarlet-inv .rsvp-status-head .rsvp-status-caption {
    color: var(--text-tertiary);
    text-transform: none;
}
.scarlet-inv .rsvp-status-body {
    margin-top: 12px;
}
.scarlet-inv .rsvp-status-wrap input[name="rsvp_status"] {
    display: none;
}
.scarlet-inv .rsvp-status-wrap input[name="rsvp_status"]:checked+.rsvp-confirm-btn.going {
    background-color: var(--button-background-tertiary);
    color: var(--button-text-tertiary);
    min-width: 50%;
}
.scarlet-inv .rsvp-status-wrap input[name="rsvp_status"]:checked+.rsvp-confirm-btn.not-going {
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
}
.scarlet-inv .rsvp-amount-wrap {
    margin: 0px 0 24px;
}
.scarlet-inv .rsvp-amount-head {
    text-align: center;
}
.scarlet-inv .rsvp-amount-head .rsvp-amount-caption {
    color: var(--text-tertiary);
}
.scarlet-inv .rsvp-session-wrap .session-caption-wrap {
    margin: 0;
}
.scarlet-inv .rsvp-session-wrap .session-caption-wrap .caption {
    font-family: var(--body-text-family);
    font-style: var(--body-text-style);
    font-weight: var(--body-text-weight);
    font-size: var(--body-text-size);
    text-transform: none;
    line-height: 1;
    color: var(--text-tertiary);
    text-align: center;
}
.scarlet-inv .rsvp-amount-body {}
.scarlet-inv .rsvp-amount-controller-wrap {
    margin-top: 12px;
}
.scarlet-inv .rsvp-amount-controller {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    gap: 8px;
}
.scarlet-inv .rsvp-amount-controller .toggle-btn {
    background-color: var(--background-secondary);
    border: 1px solid transparent;
    outline: none;
    height: 48px;
    width: 48px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s ease-in-out;
}
.scarlet-inv .rsvp-amount-controller .toggle-icon {
    width: 12px;
    height: auto;
    display: block;
    visibility: visible;
}
.scarlet-inv .rsvp-amount-controller .toggle-icon path {
    transition: all 0.25s ease-in-out;
    stroke: var(--dark-clr);
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.plus {
    background-color: var(--button-background-tertiary);
    border: none;
    border-radius: 16px;
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.plus .toggle-icon path {
    stroke: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.plus:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), .8);
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.plus:hover .toggle-icon path {
    stroke: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.minus {
    background-color: var(--button-background-secondary);
    border: none;
    border-radius: 16px;
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.minus .toggle-icon path {
    stroke: var(--button-text-secondary);
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.minus:hover {
    border-color: rgba(var(--button-background-secondary-rgb), 0.8);
}
.scarlet-inv .rsvp-amount-controller .toggle-btn.minus:hover .toggle-icon path {
    
}
.scarlet-inv .rsvp-amount-controller .input-wrap {
    width: 100%;
}
.scarlet-inv .rsvp-amount-controller .input-control {
    width: 100%;
    
    outline: none;
    text-align: center;

    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    font-weight: var(--body-text-weight);
    background: transparent;
    padding: 12px 8px;

    color: var(--button-text-primary);

    border: none;
    border: 1px solid var(--button-background-secondary);

    pointer-events: none;
    border-radius: 16px;
}
.scarlet-inv .rsvp-confirm-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 12px;
}
.scarlet-inv .rsvp-confirm-wrap>label {
    display: block;
    text-align: center;
    flex-grow: 1;
    width: 100%;
}
.scarlet-inv .rsvp-confirm-btn {
    width: 100%;
    padding: 12px;
    margin: 0px auto;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    font-weight: var(--body-text-weight);
    line-height: 1.5;

    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);

    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.25s ease-in-out;
}
.scarlet-inv .rsvp-session-btn {
    font-family: var(--body-text-family);
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
    font-size: var(--body-text-size);
    padding: 12px 24px;
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
.scarlet-inv .rsvp-session-btn.all {
    background-color: var(--button-background-tertiary);
    color: var(--button-text-tertiary);
}
.scarlet-inv .check-rsvp {
    display: flex;
    justify-content: center;
    align-items: center;
    display: none;
    transition: all 0.25s ease-in-out;
}
.scarlet-inv .rsvp-status-wrap input[name="rsvp_status"]:checked+.rsvp-confirm-btn.going .check-rsvp, .scarlet-inv .rsvp-status-wrap input[name="rsvp_status"]:checked+.rsvp-confirm-btn.not-going .check-rsvp, .scarlet-inv .session-btn-wrap input[name="selected_event[]"]:checked+.rsvp-session-btn .check-rsvp, .scarlet-inv .session-btn-wrap input[name="selected_event_all"]:checked+.rsvp-session-btn .check-rsvp {
    display: flex;
}
.scarlet-inv .rsvp-status-wrap input[name="rsvp_status"]:checked+.rsvp-confirm-btn.going .check-rsvp svg path {
    fill: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-status-wrap input[name="rsvp_status"]:checked+.rsvp-confirm-btn.not-going .check-rsvp svg path {
    fill: var(--button-text-secondary);
}
.scarlet-inv .session-btn-wrap input[name="selected_event[]"]:checked+.rsvp-session-btn, .scarlet-inv .session-btn-wrap input[name="selected_event_all"]:checked+.rsvp-session-btn {}
.scarlet-inv .rsvp-session-btn:hover {
    background-color: rgba(var(--button-background-secondary-rgb), 1);
    color: var(--button-text-secondary);
}
.scarlet-inv .session-btn-wrap {
    flex-direction: column;
}
.scarlet-inv .session-btn-wrap input[name="selected_event[]"]:checked+.rsvp-session-btn {
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
}
.scarlet-inv .session-btn-wrap input[name="selected_event_all"]:checked+.rsvp-session-btn {
    background-color: var(--button-background-tertiary);
    color: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-confirm-btn.going {
    background-color: var(--button-background-tertiary);
    color: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-confirm-btn.going:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), 1);
    color: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-confirm-btn.not-going {
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
}
.scarlet-inv .rsvp-confirm-btn.not-going:hover {
    background-color: rgba(var(--button-background-secondary-rgb), 1);
    color: var(--button-text-secondary);
}
.scarlet-inv .rsvp-confirm-btn.confirm {
    border: none;
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
    min-height: 100%;
    border-radius: 12px;
}
.scarlet-inv .rsvp-confirm-btn.confirm:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), .8);
    color: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-confirm-btn.download {
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
}
.scarlet-inv .rsvp-confirm-btn.download:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), 1);
    color: var(--button-text-tertiary);
}
.scarlet-inv .rsvp-confirm-btn>i {
    font-size: 0.8em;
    margin-left: 5px;
}
.scarlet-inv .rsvp-qrcard-wrap {
    padding: 24px 0 0;
    margin-bottom: 24px;
}
.scarlet-inv .rsvp-qrcard-img-wrap {
    margin-bottom: 12px;
}
.scarlet-inv .rsvp-form-wrapper {
    padding: 24px;
    margin-top: 24px;
    position: relative;
}
.scarlet-inv .bg-rsvp {
    position: absolute;
    width: 100%;
    height: 100%;
    inset: 0;
    border-radius: 24px;
    background: var(--background-secondary);
}
.scarlet-inv .rsvp-qrcard-img {
    display: block;
    width: 100%;
    max-width: 240px;
    border-radius: 5px;
    height: auto;
    margin: 0 auto;
    object-fit: contain;
}
.scarlet-inv .rsvp-qrcard-wrap+.rsvp-message-wrap {
    margin-top: 0;
}
.scarlet-inv .rsvp-message-wrap {
    position: relative;
}
.scarlet-inv .rsvp-message-content {
    background-color: transparent;
    border-radius: 5px;
    padding-bottom: 20px;
    text-align: center;
}
.scarlet-inv .rsvp-message-wrap .rsvp-message-icon {
    width: 30px;
    height: auto;
    display: none;
    margin: 0 auto 20px;
}
.scarlet-inv .rsvp-message-wrap .rsvp-message-icon path {
    fill: var(--title-clr);
}
.scarlet-inv .rsvp-message-wrap .rsvp-message-title {
    font-size: calc(var(--heading-size));
    margin-bottom: 20px;
}
.scarlet-inv .rsvp-message-wrap .rsvp-message-caption {
    font-size: var(--body-text-size);
    color: var(--text-secondary);
}
.scarlet-inv .orn-rsvp-divid {
    width: 100%;
    margin: 0 auto;
    position: relative;
}
.scarlet-inv .rsvp-change-wrap {}
.scarlet-inv .wedding-gift-wrap {
    position: relative;
    overflow: hidden;
    padding: 20% 0 8%;
}
.scarlet-inv .wedding-gift-inner {
    position: relative;
    width: calc(100% - 0px);
    margin: 0 auto;
    padding: 0 25px;
}
.scarlet-inv .wedding-gift-content-wrapper {
    position: relative;
    width: 100%;
    max-width: 650px;
    margin: 0 auto;
}
.scarlet-inv .wedding-gift-content {
    position: absolute;
    width: 100%;
    height: auto;
    max-height: 90%;
    left: 50%;
    transform: translate(-50%, -50%);
    top: 50%;
    padding: 23.5% 11.1% 7.1%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.scarlet-inv .wedding-gift-inner .orn-wrap {
    position: relative;
    width: 100%;
}
.scarlet-inv .wedding-gift-inner .orn-gifts-frame {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0%);
    width: 100%;
}
.scarlet-inv .wedding-gift-inner .gift-frame {
    position: relative;
    width: 100%;
    overflow-y: auto;
}
.scarlet-inv .wedding-gift-inner .gift-frame .frame-wrap {
    width: 100%;
    margin: 0 auto;
    
}
.scarlet-inv .frame-wrap .frame-gift {
    position: absolute;
}
.scarlet-inv .wedding-gift-head {
    position: relative;
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 12px;
}
.scarlet-inv .wedding-gift-head .wedding-gift-title {
    font-size: calc(var(--heading-size) - 0px);
    color: var(--text-primary);
}
.scarlet-inv .wedding-gift-head .wedding-gift-description {
    font-size: calc(var(--body-text-size));
    line-height: 150%;
}
.scarlet-inv .wedding-gift-body {
    position: relative;
    width: 100%;
    height: 100%;
}
.scarlet-inv .wedding-gift-bank-wrap {
    
    width: 100%;
    height: 100%;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-item {
    display: block;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-img-wrap {
    padding: 10px;
    display: flex;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-img-link {
    display: inline-block;
    vertical-align: top;
    margin: auto;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-img {
    width: 110px;
    height: 110px;
    display: block;
    object-fit: cover;
    object-position: center;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-detail>div {
    text-align: center;
    position: relative;
    
}
.scarlet-inv .bank-logo {
    width: 75px;
    position: relative;
    margin: 0 auto;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-detail>div:nth-child(2) {
    
}
.scarlet-inv .wedding-gift-bank-wrap .bank-detail>div:last-of-type {
    
}
.scarlet-inv .wedding-gift-bank-wrap .bank-account-number-label, .scarlet-inv .wedding-gift-bank-wrap .bank-account-name-label {
    font-size: calc(var(--body-text-size) - 4px);
    color: rgba(64, 64, 64, 0.6);
    font-family: var(--body-text-family);
    opacity: 0.75;
    
    display: block;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-name {
    font-size: calc(var(--body-text-size) - 0px);
    font-family: var(--body-text-family);
    font-weight: 700;
    word-break: break-all;
    /* Was #FCF9F4 (cream) — invisible on the cream frame-bank. Maroon reads clearly. */
    color: var(--text-primary);
    line-height: 150%;

}
.scarlet-inv .wedding-gift-bank-wrap .bank-account-name {
    font-size: calc(var(--body-text-size));
    font-family: var(--body-text-family);
    word-break: break-all;
    line-height: 150%;
    font-weight: 400;
    color: var(--text-primary);
}
.scarlet-inv .wedding-gift-bank-wrap .bank-account-number {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--body-text-size));
    font-family: var(--body-text-family);
    cursor: pointer;
    word-break: break-all;
    line-height: 150%;
    /* The account number is the key copyable info — dark + bold so it stands out. */
    font-weight: 600;
    color: var(--text-primary);
}
.scarlet-inv .wedding-gift-bank-wrap .bank-account-number>i {
    font-size: 0.8em;
    margin-left: 8px;
    border-radius: 4px;
    padding: 4px;
    border: 1px solid var(--button-background-primary);
    display: block;
    color: var(--button-text-primary);

    transition-duration: 0.15s;
    transition-property: background-color, color;
    transition-timing-function: ease-in-out;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-account-number:hover>i, .scarlet-inv .wedding-gift-bank-wrap .bank-account-number>i:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), .8);
    color: var(--button-text-tertiary);
}
.scarlet-inv .wedding-gift-bank-wrap .bank-account-number:hover {
    /* Was var(--title-clr) — undefined, which reset the number to a pale inherit
       on hover/tap. Gold signals it's tappable to copy without losing contrast. */
    color: var(--button-background-tertiary);
}
.scarlet-inv .wedding-gift-bank-wrap .bank-account-number-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
}
.scarlet-inv .wedding-gift-reveal-btn {
    border: none;
    outline: none;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: 12px 32px;
    margin: 24px auto;
    border-radius: 999px;
    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    letter-spacing: 0.02em;
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
    cursor: pointer;
    transition-duration: 0.25s;
    transition-property: background-color;
}
.scarlet-inv .wedding-gift-reveal-btn:hover {
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
}
.scarlet-inv .wedding-gift-bank-wrap .bank-copy {
    border: none;
    outline: none;
    box-shadow: none;
    display: inline-flex;
    padding: 8px;
    border-radius: 50%;
    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
    cursor: pointer;
    transition-duration: 0.25s;
    transition-property: background-color;
    margin: 0;
    line-height: normal;
}
.scarlet-inv .wedding-gift-bank-wrap .bank-copy:hover {
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
}
.scarlet-inv .custom-wedding-gifts-body {
    display: none;
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 24px 16px;
    max-width: 500px;
    background: rgba(var(--background-primary-rgb), .8);
    border-radius: 16px;
}
.scarlet-inv .custom-wedding-gifts-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.scarlet-inv .custom-wedding-gifts-wrap .wedding-gift-address-wrap {
    align-items: center;
    gap: 12px;
}
.scarlet-inv .gift-address-divider {
    margin-top: 28px;
    margin-bottom: 20px;
}
.scarlet-inv .wedding-gift-address-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}
.scarlet-inv .wedding-gift-address-wrap .inner-recipient-info {
    font-size: calc(var(--body-text-size));
    color: var(--text-primary);
    text-align: center;
    line-height: 150%;
}
.scarlet-inv .wedding-gift-address-wrap .inner-recipient-info.name, .scarlet-inv .wedding-gift-address-wrap .inner-recipient-info.phone {
    font-size: calc(var(--body-text-size));
    color: var(--text-secondary);
    text-align: center;
    line-height: 150%;
}
.scarlet-inv .wedding-gift-address-wrap .inner-address-info {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    color: var(--text-primary);
    line-height: 150%;
    text-align: center;
}
.scarlet-inv .custom-wedding-gifts-wrap .btn-hadiah-copy {
    display: inline-flex;
    justify-content: center;
    border-radius: 100px;
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    padding: 12px 16px;

    transition-duration: 0.15s;
    transition-property: background-color, color;
    transition-timing-function: ease-in-out;
}
.scarlet-inv .custom-wedding-gifts-wrap .btn-hadiah-copy:hover {
    background-color: var(--button-background-secondary);
    color: var(--button-text-secondary);
}
.scarlet-inv .gift-bg-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    inset: 0;
    background-image: var(--bg-gift);
    background-size: cover;
    background-position: center;
    opacity: .5;
}
@media (max-width: 320px) {
.scarlet-inv .wedding-gift-inner {}
}
@media screen and (min-width: 561px) and (max-width: 960px) {
.scarlet-inv .wedding-gift-inner {
        
    }
.scarlet-inv .wedding-gift-head {
        gap: 24px;
    }
}
@media (min-width: 961px) {
.scarlet-inv .wedding-gift-head {
        gap: 16px;
    }
}
@media (min-width: 1600px) {
.scarlet-inv .wedding-gift-inner .orn-wrap {
        max-width: 430px;
    }
.scarlet-inv .wedding-gift-head {
        gap: 24px;
    }
}
.scarlet-inv .wedding-wish-wrap {
    position: relative;
    overflow: hidden;
    padding: 40px 24px;
    background-image: var(--texture-couple);
    background-size: 100% auto;
    background-repeat: repeat;
}
.scarlet-inv .wedding-wish-inner {
    position: relative;
    max-width: 650px;
    margin: 0 auto;
}
.scarlet-inv .wedding-wish-head {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 11%;
}
.scarlet-inv .wedding-wish-head .wedding-wish-title {
    color: var(--text-primary);
    font-family: var(--heading-family);
    font-size: var(--heading-size);
}
.scarlet-inv .wedding-wish-head .wedding-wish-description {
    font-family: var(--body-text-family-2);
    font-size: 16px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0;
}
.scarlet-inv .wedding-wish-body {
    padding: 24px 0px;
}
.scarlet-inv .wedding-wish-form {
    padding-bottom: 32px;
}
.scarlet-inv .wedding-wish-form .hide {
    display: none;
}
.scarlet-inv .wedding-wish-form .form-control {
    display: block;
    width: 100%;
    box-sizing: border-box;
    background-color: #FFFF;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 12px;
    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    line-height: 1.5;
    color: rgba(64, 64, 64, 0.50);
}
.scarlet-inv .wedding-wish-form .form-control::placeholder {
    
    color: rgba(64, 64, 64, 0.5);
}
.scarlet-inv .wedding-wish-form .form-control:-ms-input-placeholder {
    
    color: rgba(64, 64, 64, 0.5);
}
.scarlet-inv .wedding-wish-form .form-control::-ms-input-placeholder {
    
    color: rgba(64, 64, 64, 0.5);
}
.scarlet-inv .wedding-wish-form .form-control:focus {
    border: 1px solid var(--text-primary);
    box-shadow: none;
}
.scarlet-inv .wedding-wish-form textarea.form-control {
    min-height: 90px;
    max-height: 250px;
    resize: vertical;
}
.scarlet-inv .wedding-wish-form .submit-comment {
    padding: 12px 24px;
    cursor: pointer;
    border: none;
    border-radius: 16px;
    outline: none;
    background-color: rgba(var(--button-background-tertiary-rgb), 1);
    color: var(--button-text-tertiary);
    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    font-weight: 400;
    line-height: 150%;
    transition: all 0.25s ease-in-out;
    width: 100%;
}
.scarlet-inv .wedding-wish-form .submit-comment:hover {
    background-color: rgba(var(--button-background-tertiary-rgb), 0.8);
    color: var(--button-text-tertiary);
}
.scarlet-inv .comment-box-wrap {
    position: relative;
}
.scarlet-inv .comment-box-wrap .form-group {
    margin-bottom: 0;
}
.scarlet-inv .comment-box-wrap textarea.form-control {
    height: auto;
    min-height: 0;
}
.scarlet-inv .comment-box-wrap .submit-comment-wrap {
    position: absolute;
    top: 0;
    right: 0;
}
.scarlet-inv .wedding-wish-form form .submit-comment-wrap {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.scarlet-inv .comment-box-wrap.focus textarea.form-control {
    
}
.scarlet-inv .comment-box-wrap.focus .submit-comment-wrap {
    top: auto;
    bottom: 0;
}
.scarlet-inv .comment-wrap {
    display: none;
}
.scarlet-inv .comment-wrap.show {
    display: block;
}
.scarlet-inv .comment-item {
    margin-bottom: 12px;
}
.scarlet-inv .comment-item:last-of-type {
    margin-bottom: 0px;
}
/* Folk wishes only (scoped via .folk-wish so the Scarlet template is untouched):
   red inputs (border + text, incl. focus), red send. Wish cards are styled
   inline (Tailwind) in folk-wishes.tsx. */
.scarlet-inv .folk-wish .wedding-wish-form .form-control {
    border: 1px solid #700F06;
    border-radius: 12px;
    color: #700F06;
}
.scarlet-inv .folk-wish .wedding-wish-form .form-control:focus {
    border: 1px solid #700F06;
    color: #700F06;
    outline: none;
    box-shadow: none;
}
.scarlet-inv .folk-wish .wedding-wish-form .submit-comment {
    background-color: #700F06;
    color: #F5F2E4;
}
.scarlet-inv .folk-wish .wedding-wish-form .submit-comment:hover {
    background-color: #5A0C05;
    color: #F5F2E4;
}
.scarlet-inv .folk-wish .wish-more {
    text-align: center;
    padding-top: 8px;
}
.scarlet-inv .folk-wish .wish-more button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 24px;
    border-radius: 9999px;
    border: 1px solid #700F06;
    background: transparent;
    color: #700F06;
    font-family: var(--body-text-family-2);
    font-size: 13px;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}
.scarlet-inv .folk-wish .wish-more button:hover {
    background: #700F06;
    color: #F5F2E4;
}
.scarlet-inv .comment-head {
    position: relative;
    margin-bottom: 8px;
}
.scarlet-inv .comment-head .comment-name {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size) + 4px);
    font-weight: 400;
    line-height: 142%;
    color: var(--text-primary);
}
.scarlet-inv .comment-head .comment-name>i {
    font-size: 0.7em;
}
.scarlet-inv .comment-head .comment-date {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    
    line-height: 150%;
    display: block;
    margin-top: 8px;
    color: var(--text-secondary);
}
.scarlet-inv .comment-head .delete-comment {
    position: absolute;
    top: 0px;
    right: 0px;
    text-decoration: none;
    display: inline-block;
    vertical-align: top;
    color: var(--text-primary);
    transition: color 0.25s ease-in-out;
}
.scarlet-inv .comment-head .delete-comment:hover {
    color: rgba(var(--button-background-secondary-rgb), 0.8);
}
.scarlet-inv .comment-body {}
.scarlet-inv .comment-body .comment-caption {
    font-family: var(--body-text-family);
    font-size: calc(var(--body-text-size));
    line-height: 150%;
}
.scarlet-inv .more-comment-wrap {
    padding: 20px 0px 0px;
    display: none;
    text-align: center;
}
.scarlet-inv .more-comment-wrap.show {
    display: block;
}
.scarlet-inv #moreComment {
    border: none;
    outline: none;
    width: 100%;
    display: block;
    padding: 12px 16px;
    margin: 0 auto;
    border-radius: 12px;
    text-decoration: none;
    background-color: var(--button-background-primary);
    color: var(--button-text-primary);
    font-family: var(--body-text-family);
    font-size: var(--body-text-size);
    font-weight: 400;
    line-height: 1.5;
    cursor: pointer;
    transition: all 0.25s ease-in-out;
}
.scarlet-inv #moreComment:hover {
    background-color: rgba(var(--button-background-primary-rgb), 0.75);
    color: var(--button-text-primary);
}
.scarlet-inv .quote-sec-wrap {
    position: relative;
    overflow: hidden;
    padding: 5% 0 10%;
}
.scarlet-inv .frame-qt {
    position: relative;
    width: 100%;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
}
.scarlet-inv .quote-sec-inner {
    position: relative;
    padding-bottom: 10%;
}
.scarlet-inv .quote-sec-wrap .quote-sec {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
    padding: 20.5% 18%;
    width: 100%;
    margin: 0 auto;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%);
}
.scarlet-inv .quote-sec .quote-sec-caption.bottom {
    color: var(--text-primary);
    font-size: calc(var(--body-text-size));
    line-height: 150%;
    font-weight: 700;
    font-family: var(--body-text-family-2);
}
.scarlet-inv .quote-sec .quote-sec-caption {
    color: var(--text-primary);
    font-size: calc(var(--body-text-size));
    line-height: 150%;
    width: 100%;
    margin: 0 auto;
    font-family: var(--body-text-family-2);

}
.scarlet-inv .quote-message-wrap {
    overflow: hidden;
    position: relative;
    padding: 10% 19px 9%;
}
.scarlet-inv .quote-message-wrap::before {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    background: linear-gradient(180deg, rgba(245, 242, 228, 0.00) 0%, rgba(245, 242, 228, 0.00) 50%, #F5F2E4 100%);
}
.scarlet-inv .quote-message-wrap .quote-message {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
}
.scarlet-inv .quote-message-wrap .quote-message-inner-wrap {
    position: relative;
    width: 100%;
    overflow: hidden;
    padding: 16px;
    background: var(--background-secondary);
    border-radius: 500px 500px 0px 0px;
}
.scarlet-inv .quote-message-wrap .quote-message .quote-message-inner {
    display: flex;
    padding: 19.6% 14% 14%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    flex: 1 0 0;
    background: var(--background-primary);
    border-radius: 500px 500px 0px 0px;
    border: 2px solid var(--text-secondary);
    text-align: center;
}
.scarlet-inv .quote-message-wrap .quote-message-title {
    font-size: calc(var(--heading-size));
    text-align: center;
}
.scarlet-inv .quote-message-wrap .quote-message-desc {
    line-height: 150%;
    text-transform: none;
}
@media (min-width: 700px) {
.scarlet-inv .quote-message-wrap .quote-message .quote-message-inner {
        padding-top: 30%;
    }
}
.scarlet-inv .footnote-wrap {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    padding: 0;
}
.scarlet-inv .footnote-inner {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100vh;
    
    justify-content: flex-start;
    padding-top: 8%;
}
.scarlet-inv section.footnote-wrap .logo-wrap {
    position: relative;
    width: 41.5%;
    max-width: 190px;
    margin: 0 auto;
}
.scarlet-inv .ff-mask {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(245, 242, 228, 0.00) 0%, rgba(245, 242, 228, 0.00) 50%, #F5F2E4 100%);
}
.scarlet-inv .footnote-wrap .footnote-inner {}
.scarlet-inv .footnote-inner .footnote-body {
    padding-bottom: 10%;
}
.scarlet-inv .footnote-inner .footnote-head {
    position: relative;
    padding: 10% 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
}
.scarlet-inv .top-text {}
.scarlet-inv .bottom-text {}
.scarlet-inv .footnote-head .footnote-title {
    text-transform: uppercase;

    font-size: calc(var(--heading-size));
    font-weight: 600;
}
.scarlet-inv .footnote-head .date {
    color: var(--text-primary);
    font-weight: 700;
    font-family: var(--heading-family);
}
.scarlet-inv .footnote-inner .footnote-orn-wrap {
    position: relative;
}
.scarlet-inv section.footnote-wrap .footnote-inner .highlight {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.scarlet-inv section.footnote-wrap .footnote-inner .highlight .cover-frame {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    isolation: isolate;
    background: var(--background-primary);
}
.scarlet-inv section.footnote-wrap .footnote-inner .highlight .preview-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0 auto;
}
.scarlet-inv section.footnote-wrap .footnote-inner .highlight .preview-container .slick-list {
    width: 100% !important;
    height: 100% !important;
}
.scarlet-inv section.footnote-wrap .footnote-inner .highlight .preview-container .slick-track {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
}
.scarlet-inv section.footnote-wrap .footnote-inner .highlight .preview-container .picture {
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    position: absolute !important;
    background-color: var(--light-clr);
}
.scarlet-inv section.footnote-wrap .footnote-inner .highlight .preview-container .picture img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
}
/* Folk closing (.footnote-plain): no logo/ornaments, so collapse the forced
   100vh full-screen frame — un-absolute the photo/video chain so the section
   sizes to the closing media's natural height (no blank space below it). */
.scarlet-inv section.footnote-wrap.footnote-plain {
    min-height: 0;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner {
    height: auto;
    padding-top: 0;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .ff-mask {
    display: none;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight {
    position: relative;
    inset: auto;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight .cover-frame {
    position: relative;
    inset: auto;
    height: auto;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight .preview-container {
    position: relative;
    height: auto;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight .preview-container .slick-list,
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight .preview-container .slick-track {
    height: auto !important;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight .preview-container .picture {
    position: relative !important;
    height: auto !important;
}
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight .preview-container .picture img,
.scarlet-inv section.footnote-wrap.footnote-plain .footnote-inner .highlight .preview-container .picture video {
    height: auto;
}
@media (min-width: 1200px) {
.scarlet-inv .rsvp-inner {
        
    }
}
.scarlet-inv section.footer {
    background: var(--background-secondary);
    padding: 0;
    position: relative;
}
.scarlet-inv section.footer .footer-inner {
    padding: 10px 0;
}
.scarlet-inv section.footer .footer-inner p {
    font-size: var(--body-text-size);
    font-weight: 400;
    color: var(--background-primary);
}
.scarlet-inv .footer .footer-inner .footer-logo {
    width: 55px;
}
.scarlet-inv section.footer .footer-inner .footer-logo path {
    fill: var(--background-primary);
}
@media only screen and (max-width: 960px) {
.scarlet-inv section.footer .footer-inner.flex-column {
        flex-direction: column;
        padding-top: 80px;
        padding-bottom: 150px;
    }
.scarlet-inv section.footer .footer-inner.flex-column p {
        margin-right: 0;
        font-size: calc(var(--body-text-size) + var(--fs-extra-2));
    }
.scarlet-inv section.footer .footer-inner.flex-column .footer-logo {
        margin-top: 10px;
        width: 150px;
    }
}
.scarlet-inv .burung-1 {
    position: absolute;
    width: clamp(45px, 11.5%, 95px);
}
.scarlet-inv .burung-2 {
    position: absolute;
    width: clamp(64px, 16.4%, 105px);
}
@media (min-width : 560px) and (max-width: 961px) {
.scarlet-inv .burung-2 {
        width: clamp(94px, 16.4%, 105px);
    }
.scarlet-inv .burung-1 {
        width: clamp(75px, 11.5%, 95px);
    }
}
@media (min-width : 1560px) {
.scarlet-inv .burung-2 {
        width: clamp(94px, 16.4%, 105px);
    }
.scarlet-inv .burung-1 {
        width: clamp(75px, 11.5%, 95px);
    }
}
.scarlet-inv .orn-clip-mask {
    position: absolute;
    width: 100%;
    left: 50%;
    transform: translate(-50%, -4%) scaleY(-1);
    top: 0;
    opacity: .5;
}
.scarlet-inv .orn-clip-mask.bot {
    position: absolute;
    width: 100%;
    left: 50%;
    transform: translate(-50%, 4%);
    top: unset;
    bottom: 0;
}
.scarlet-inv .orn-cover-1.top {
    position: absolute;
    width: 100%;
    top: 0;
    left: 50%;
    transform: translate(-50%, -20%);
    opacity: .5;
}
.scarlet-inv .orn-cover-2.right {
    position: absolute;
    width: 50.90%;
    bottom: 0;
    right: 0%;
    transform: translate(47.85%, 24%);
    /* In front of the cover photo (z 999), but still inside the cover's own
       stacking context so it never overlaps the gate's "Buka Undangan" button. */
    z-index: 1000;
}
.scarlet-inv .orn-cover-2-1 {
    position: absolute;
    width: 74.2%;
    bottom: 12.5%;
    left: 0%;
    transform: translate(-40.38%, 0%);
}
.scarlet-inv .orn-cover-3.center {
    position: absolute;
    width: 43.45%;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 17.7%);
}
.scarlet-inv .orn-cover-4.left {
    position: absolute;
    width: 51.63%;
    bottom: 0;
    left: 0%;
    transform: translate(-12%, 29.5%);
    z-index: 1000;
}
.scarlet-inv .orn-cover-5.right {
    position: absolute;
    width: 25%;
    bottom: 6%;
    right: 0%;
    transform: translate(50.35%, -26%) scaleX(-1);
}
.scarlet-inv .orn-cover-6.left {
    position: absolute;
    width: 22.30%;
    bottom: 0%;
    left: 0%;
    transform: translate(-22%, -1%) scaleX(-1);
}
.scarlet-inv .orn-cover-6-1 {
    position: absolute;
    width: 89.6%;
    bottom: 55.6%;
    left: 32.75%;
    transform: translate(0%, 0%);
}
.scarlet-inv .orn-cover-7.right {
    position: absolute;
    width: 48.54%;
    bottom: 0%;
    right: 0%;
    transform: translate(66%, 0%) scaleX(-1);
}
.scarlet-inv .orn-cover-7.left {
    position: absolute;
    width: 48.54%;
    bottom: 0%;
    left: 0%;
    transform: translate(-63.77%, 0%) scaleX(-1);
}
.scarlet-inv .orn-cover-8.left {
    position: absolute;
    width: 29.45%;
    bottom: 42%;
    left: 0%;
    transform: translate(-50.617%, 0%) scaleX(-1);
}
.scarlet-inv .orn-cover-9.left {
    position: absolute;
    width: 53.07%;
    bottom: 0%;
    left: 0%;
    transform: translate(-50%, -25%);
}
.scarlet-inv .orn-cover-10.left {
    position: absolute;
    width: 30.25%;
    bottom: 0%;
    right: 0%;
    transform: translate(32.20%, -39%);
}
.scarlet-inv .orn-cover-11.right {
    position: absolute;
    width: 21.53%;
    bottom: 15%;
    right: 0%;
    transform: translate(43.2%, -42%) scaleX(-1) rotate(21deg);
}
.scarlet-inv .orn-cover-12.left {
    position: absolute;
    width: 14.35%;
    bottom: 20%;
    left: 0%;
    transform: translate(-27%, -72%);
}
.scarlet-inv .orn-cover-12.right {
    position: absolute;
    width: 14.35%;
    bottom: 20%;
    right: 0%;
    transform: translate(27%, -72%) scaleX(-1);
}
.scarlet-inv .orn-cover-13.left {
    position: absolute;
    width: 23.07%;
    bottom: 26%;
    left: 0%;
    transform: translate(-45%, -72%) rotate(24deg) scaleX(-1);
}
.scarlet-inv .orn-cover-13.right {
    position: absolute;
    width: 23.07%;
    bottom: 26%;
    right: 0%;
    transform: translate(45%, -72%) rotate(-24deg);
}
.scarlet-inv .orn-cover-14.left {
    position: absolute;
    width: 69%;
    bottom: 14%;
    left: 0%;
    transform: translate(-74%, -69%);
}
.scarlet-inv .orn-cover-14.right {
    position: absolute;
    width: 69%;
    bottom: 14%;
    right: 0%;
    transform: translate(74%, -69%) scaleX(-1);
}
.scarlet-inv .orn-cover-15 {
    left: 11%;
    bottom: 50%;
}
.scarlet-inv .orn-cover-16 {
    right: 11%;
    bottom: 48%;
}
@media (min-width: 561px) and (max-width: 960px) {
.scarlet-inv .orn-cover-13.right, .scarlet-inv .orn-cover-13.left {
        width: 20.07%;
    }
.scarlet-inv .orn-cover-12.right, .scarlet-inv .orn-cover-12.left {
        width: 12.35%;
    }
.scarlet-inv .orn-cover-14.right, .scarlet-inv .orn-cover-14.left {
        width: 63%;
    }
}
.scarlet-inv .orn-cp-head.right {
    position: absolute;
    right: 0;
    transform: translate(50%, 0%) scaleX(-1);
    top: 0;
    width: 40.38%;
}
.scarlet-inv .orn-cp-head.left {
    position: absolute;
    left: 0;
    transform: translate(-50%, 0%);
    top: 0;
    width: 40.38%;
}
.scarlet-inv .orn-couple-1 {
    position: absolute;
    width: 31.02%;
    left: 10%;
    bottom: 0;
    transform: translate(-4%, 36.6%) scaleX(-1);
}
.scarlet-inv .orn-couple-1-1 {
    position: absolute;
    width: 105.7%;
    right: 0%;
    bottom: 11.33%;
    transform: translate(-55%, 0%);
}
.scarlet-inv .orn-couple-1-2 {
    position: absolute;
    width: 63.63%;
    right: 0%;
    top: 0%;
    transform: translate(18.18%, -63.63%);
}
.scarlet-inv .orn-couple-2 {
    position: absolute;
    width: 27.17%;
    right: 8%;
    bottom: 0;
    transform: translate(9%, 27.89%) scaleX(-1);
}
.scarlet-inv .orn-couple-2-1 {
    position: absolute;
    width: 109.4%;
    left: 71.69%;
    bottom: 0;
    transform: translate(0%, 7.4%);
}
.scarlet-inv .orn-couple-3 {
    position: absolute;
    width: 56.9%;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, -21%);
}
.scarlet-inv .orn-couple-4.right {
    position: absolute;
    width: 33.84%;
    right: 0%;
    bottom: 0;
    transform: translate(0%, -11%);
}
.scarlet-inv .orn-couple-4.left {
    position: absolute;
    width: 33.84%;
    left: 0%;
    bottom: 0;
    transform: translate(0%, -11%) scaleX(-1);
}
.scarlet-inv .orn-couple-edge.right {
    position: absolute;
    width: 36.4%;
    max-width: 210px;
    right: 0%;
    top: 0;
    transform: translate(34%, -55%) rotate(16deg) scaleX(-1);
}
.scarlet-inv .orn-couple-edge.left {
    position: absolute;
    width: 36.4%;
    max-width: 210px;
    left: 0%;
    top: 0;
    transform: translate(-34%, -55%) rotate(-16deg);
}
.scarlet-inv .orn-photo-1.right {
    position: absolute;
    width: 17%;
    right: 0%;
    bottom: 0;
    transform: translate(42%, 10%) scaleX(-1);
}
.scarlet-inv .orn-photo-1.left {
    position: absolute;
    width: 17%;
    left: 0%;
    bottom: 0;
    transform: translate(-42%, 10%);
}
.scarlet-inv .orn-photo-1-1 {
    position: absolute;
    width: 100%;
    left: 0%;
    bottom: 0;
    transform: translate(-46%, -6%);
}
.scarlet-inv .orn-photo-2.right {
    position: absolute;
    width: 47%;
    right: 0%;
    bottom: 0;
    transform: translate(50%, 0%) scaleX(-1);
}
.scarlet-inv .orn-photo-2.left {
    position: absolute;
    width: 47%;
    left: 0%;
    bottom: 0;
    transform: translate(-50%, 0%);
}
.scarlet-inv .orn-photo-2-1 {
    position: absolute;
    width: 62.83%;
    left: 11%;
    top: 7%;
    transform: translate(-1%, 0%);
}
.scarlet-inv .orn-photo-3.right {
    position: absolute;
    width: 59%;
    right: 0%;
    top: 0;
    transform: translate(33%, -4%) rotate(18deg) scaleX(-1);
}
.scarlet-inv .orn-photo-3.left {
    position: absolute;
    width: 59%;
    left: 0%;
    top: 0;
    transform: translate(-33%, -4%) rotate(-18deg);
}
.scarlet-inv .orn-photo-4.right {
    position: absolute;
    width: 55%;
    max-width: 350px;
    right: 0%;
    top: 0;
    transform: translate(14.74%, 6%) scaleX(-1);
}
.scarlet-inv .orn-photo-4.left {
    position: absolute;
    width: 55%;
    max-width: 350px;
    left: 0%;
    top: 0;
    transform: translate(-14.74%, 6%);
}
.scarlet-inv .orn-video-1 {
    position: relative;
    transform: scaleY(-1);
    width: 100%;
    opacity: .5;
}
.scarlet-inv .orn-lv-1 {
    position: absolute;
    width: 37.82%;
    right: 0;
    bottom: 0;
    transform: translate(33%, -5%);
}
.scarlet-inv .orn-lv-1-1 {
    position: absolute;
    width: 47.45%;
    right: 0;
    bottom: 51.38%;
    transform: translate(0%, 0%);
}
.scarlet-inv .orn-lv-2 {
    position: absolute;
    width: 24.67%;
    right: 0;
    top: 0;
    transform: translate(66%, -5%) rotate(10.80deg);
}
.scarlet-inv .orn-lv-3 {
    position: absolute;
    width: 21.47%;
    right: 0;
    top: 0;
    transform: translate(14%, -37%);
}
.scarlet-inv .orn-lv-4 {
    position: absolute;
    width: 24%;
    left: 0;
    bottom: 0;
    transform: translate(-52%, 17%);
}
.scarlet-inv .orn-lv-4-1 {
    position: absolute;
    width: 85.33%;
    right: 0;
    bottom: 0;
    transform: translate(52%, -2%) scaleX(-1);
}
.scarlet-inv .orn-lv-5 {
    position: absolute;
    width: 25.64%;
    left: 0;
    bottom: 0;
    transform: translate(-57.5%, -17%);
}
.scarlet-inv .orn-sd-1 {
    position: absolute;
    width: 48.876%;
    left: 0;
    bottom: 0;
    transform: translate(29%, 13.7%);
}
.scarlet-inv .orn-sd-1-1 {
    position: absolute;
    width: 41.37%;
    left: 10%;
    bottom: 0;
    transform: translate(76%, 31.7%) rotate(117deg);
}
.scarlet-inv .orn-sd-2 {
    position: absolute;
    width: 30.617%;
    right: 0;
    bottom: 0;
    transform: translate(-47%, 21.79%);
}
.scarlet-inv .orn-sd-3 {
    position: absolute;
    width: 22.33%;
    right: 0;
    bottom: 0;
    transform: translate(-19%, -48%) scaleX(-1);
}
.scarlet-inv .orn-sd-4 {
    position: absolute;
    width: 19.66%;
    left: 0;
    bottom: 0;
    transform: translate(28%, -59%);
}
.scarlet-inv .orn-sd-4-1 {
    position: absolute;
    width: 82.85%;
    left: 0;
    bottom: 0;
    transform: translate(26%, -7%) scaleX(-1);
}
.scarlet-inv .orn-sd-5 {
    position: absolute;
    width: 31.17%;
    right: 0;
    top: 0;
    transform: translate(0%, 12%);
}
.scarlet-inv .orn-sd-bg {
    position: absolute;
    width: 100%;
    top: 0;
    left: 50%;
    transform: translate(-50%, 15%);
}
.scarlet-inv .orn-bank-1 {
    position: absolute;
    width: 48.82%;
    left: 0;
    bottom: 0;
    transform: translate(-21%, 11%);
}
.scarlet-inv .orn-bank-1-1 {
    position: absolute;
    width: 67.7%;
    left: 0;
    top: 0;
    transform: translate(-16.8%, -29.26%);
}
.scarlet-inv .orn-bank-1-1-1 {
    position: absolute;
    width: 73.77%;
    left: 13.33%;
    top: 0;
    transform: translate(-0%, -55%);
}
.scarlet-inv .orn-bank-2 {
    position: absolute;
    width: 39.55%;
    right: 0;
    bottom: 0;
    transform: translate(18.95%, 20.17%);
}
.scarlet-inv .orn-bank-2-1 {
    position: absolute;
    width: 51.85%;
    right: 0;
    bottom: 33.3%;
    transform: translate(0%, 0%);
}
.scarlet-inv .orn-bank-3 {
    position: absolute;
    width: 57.05%;
    right: 0;
    bottom: 0;
    transform: translate(62.88%, -20.17%);
}
.scarlet-inv .orn-bank-4.right {
    position: absolute;
    width: 61.4%;
    right: 0;
    top: 0;
    transform: translate(24%, -5%) scaleX(-1);
}
.scarlet-inv .orn-bank-4.left {
    position: absolute;
    width: 61.4%;
    left: 0;
    top: 0;
    transform: translate(-24%, -5%);
}
.scarlet-inv .orn-bank-5 {
    left: 0;
    top: 0;
    transform: translate(0%, -27%);
}
.scarlet-inv .orn-bank-6 {
    right: 0;
    top: 0;
    transform: translate(20%, -78%);
}
@media (min-width: 561px) and (max-width: 961px) {
.scarlet-inv .orn-bank-3 {
        width: 53.05%;
        transform: translate(53.88%, -20.17%);
    }
.scarlet-inv .orn-bank-1-1-1 {
        width: 67.77%;
        left: 17.33%;
        top: 0;
        transform: translate(-0%, -33%);
    }
.scarlet-inv .orn-bank-4.left {
        transform: translate(-31%, -5%);
        width: 60.4%;
    }
.scarlet-inv .orn-bank-4.right {
        transform: translate(31%, -5%) scaleX(-1);
        width: 60.4%;
    }
}
.scarlet-inv .orn-event-1 {
    position: absolute;
    width: 32.30%;
    right: 0;
    bottom: 0;
    transform: translate(20.63%, 26%);
}
.scarlet-inv .orn-event-1-1 {
    position: absolute;
    width: 84.12%;
    right: 20.63%;
    bottom: 15.65%;
    transform: translate(0%, 0%);
}
.scarlet-inv .orn-event-1-1-1 {
    position: absolute;
    width: 78.4%;
    right: 0%;
    bottom: 55.2%;
    transform: translate(17%, 0%);
}
.scarlet-inv .orn-event-1-1-1-1 {
    position: absolute;
    width: 97.95%;
    right: 32.13%;
    bottom: 57.57%;
    transform: translate(0%, 0%) scaleX(-1);
}
.scarlet-inv .orn-event-2 {
    position: absolute;
    width: 41.02%;
    right: 0;
    bottom: 24.82%;
    transform: translate(40.625%, 0%) scaleX(-1);
}
.scarlet-inv .orn-event-3 {
    position: absolute;
    width: 30.76%;
    left: 0;
    bottom: 0;
    transform: translate(-10.83%, 29.29%);
}
.scarlet-inv .orn-event-3-1 {
    position: absolute;
    width: 90%;
    right: 0;
    bottom: 17.17%;
    transform: translate(-5%, 0%);
}
.scarlet-inv .orn-event-3-1-1 {
    position: absolute;
    width: 87%;
    left: 0;
    top: 0%;
    transform: translate(-22.34%, -19%) scaleX(-1);
}
.scarlet-inv .orn-event-3-1-1-1 {
    position: absolute;
    width: 65.7%;
    left: 0;
    top: 0%;
    transform: translate(-19%, -29%);
}
.scarlet-inv .orn-event-3-1-1-1-1 {
    position: absolute;
    width: 124.11%;
    left: 50%;
    top: 0%;
    transform: translate(-50%, -44.23%);
}
.scarlet-inv .orn-event-4 {
    position: absolute;
    width: 26.66%;
    left: 0;
    bottom: 29.24%;
    transform: translate(-42%, 0%);
}
.scarlet-inv .orn-event-5 {
    position: absolute;
    width: 65.89%;
    left: 0;
    top: 5%;
    transform: translate(-72.79%, 0%);
}
.scarlet-inv .orn-event-6.center {
    position: absolute;
    width: 72.05%;
    left: 50%;
    bottom: 0%;
    transform: translate(-50%, 40%);
}
.scarlet-inv .orn-event-7.right {
    position: absolute;
    width: 72%;
    right: 0%;
    top: 0%;
    transform: translate(30.62%, -50%);
}
.scarlet-inv .orn-event-7.left {
    position: absolute;
    width: 72%;
    left: 0%;
    top: 0%;
    transform: translate(-30.62%, -50%) scaleX(-1);
}
.scarlet-inv .orn-event-8.center {
    position: absolute;
    width: 77%;
    left: 50%;
    bottom: 0%;
    transform: translate(-50%, 0%);
}
.scarlet-inv .orn-event-9 {
    top: 6%;
    left: 10%;
}
.scarlet-inv .orn-event-10 {
    top: 23%;
    right: 4%;
}
.scarlet-inv .orn-rsvp-1.right {
    position: absolute;
    width: 27.64%;
    right: 0;
    bottom: 0;
    transform: translate(55.65%, 0%) scaleX(-1);
}
.scarlet-inv .orn-rsvp-2.right {
    position: absolute;
    width: 71.61%;
    right: 0;
    bottom: 9%;
    transform: translate(50%, -2%);
}
.scarlet-inv .orn-rsvp-1.left {
    position: absolute;
    width: 27.64%;
    left: 0;
    bottom: 0;
    transform: translate(-55.65%, 0%);
}
.scarlet-inv .orn-rsvp-2.left {
    position: absolute;
    width: 71.61%;
    left: 0;
    bottom: 9%;
    transform: translate(-50%, -2%) scaleX(-1);
}
.scarlet-inv .orn-rsvp-2-1 {
    position: absolute;
    width: 40.54%;
    left: 27%;
    top: 0%;
    transform: translate(0%, -2%) rotate(21deg) scaleX(-1);
}
.scarlet-inv .orn-rsvp-3.right {
    position: absolute;
    width: 35.16%;
    right: 0;
    bottom: 0;
    transform: translate(32.11%, 23.88%);
}
.scarlet-inv .orn-rsvp-3.left {
    position: absolute;
    width: 35.16%;
    left: 0;
    bottom: 0;
    transform: translate(-32.11%, 23.88%) scaleX(-1);
}
.scarlet-inv .orn-rsvp-3-1 {
    position: absolute;
    width: 128.44%;
    right: 0;
    bottom: 0;
    transform: translate(2.11%, 29.31%);
}
.scarlet-inv .orn-wish-1.right {
    position: absolute;
    width: 36%;
    max-width: 150px;
    right: 0;
    top: 0;
    transform: translate(52%, 0%);
}
.scarlet-inv .orn-wish-1.left {
    position: absolute;
    width: 36%;
    max-width: 150px;
    left: 0;
    top: 0;
    transform: translate(-52%, 0%) scaleX(-1);
}
.scarlet-inv .orn-qt-1.center {
    position: absolute;
    width: 69%;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0%);
}
.scarlet-inv .orn-qt-1-1.right {
    position: absolute;
    width: 47.43%;
    top: 0;
    right: 0%;
    transform: translate(3%, 0%);
}
.scarlet-inv .orn-qt-1-1.left {
    position: absolute;
    width: 47.43%;
    top: 0;
    left: 0%;
    transform: translate(-3%, 0%) scaleX(-1);
}
.scarlet-inv .orn-qt-2.right {
    position: absolute;
    width: 36.6%;
    bottom: 0;
    right: 0%;
    transform: translate(20.97%, -16%);
}
.scarlet-inv .orn-qt-2.left {
    position: absolute;
    width: 36.6%;
    bottom: 0;
    left: 0%;
    transform: translate(-20.97%, -16%) scaleX(-1);
}
.scarlet-inv .orn-qt-2-1 {
    position: absolute;
    width: 88.11%;
    bottom: 0;
    left: 0%;
    transform: translate(-5%, 35%);
}
.scarlet-inv .orn-qt-2-1-1 {
    position: absolute;
    width: 40.47%;
    bottom: 24.32%;
    right: 0%;
    transform: translate(0%, 0%);
}
.scarlet-inv .orn-qt-2-2 {
    position: absolute;
    width: 50.34%;
    top: 0;
    right: 0%;
    transform: translate(-24%, -67.25%) scaleX(-1);
}
.scarlet-inv .orn-qt-bg {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
    opacity: .5;
}
.scarlet-inv .orn-qm-1.right {
    position: absolute;
    width: 36.36%;
    bottom: 0;
    right: 0%;
    transform: translate(17.18%, 39.62%);
}
.scarlet-inv .orn-qm-1.left {
    position: absolute;
    width: 36.36%;
    bottom: 0;
    left: 0%;
    transform: translate(-17.18%, 39.62%) scaleX(-1);
}
.scarlet-inv .orn-qm-2.right {
    position: absolute;
    width: 30.68%;
    bottom: 0;
    right: 0%;
    transform: translate(28.70%, 0%) scaleX(-1);
}
.scarlet-inv .orn-qm-2.left {
    position: absolute;
    width: 30.18%;
    bottom: 0;
    left: 0%;
    transform: translate(-28.70%, 0%) scaleX(-1);
}
.scarlet-inv .orn-qm-3.right {
    position: absolute;
    width: 12.78%;
    bottom: 25%;
    right: 0%;
    transform: translate(24.4%, -14%);
}
.scarlet-inv .orn-qm-3.left {
    position: absolute;
    width: 12.78%;
    bottom: 25%;
    left: 0%;
    transform: translate(-24.4%, -14%) scaleX(-1);
}
.scarlet-inv .orn-qm-4.right {
    position: absolute;
    width: 20.22%;
    bottom: 36%;
    right: 0%;
    transform: translate(21%, -23%);
}
.scarlet-inv .orn-qm-4.left {
    position: absolute;
    width: 20.22%;
    bottom: 36%;
    left: 0%;
    transform: translate(-21%, -23%) scaleX(-1);
}
.scarlet-inv .orn-qm-4-1 {
    position: absolute;
    width: 73.033%;
    top: 0%;
    left: 0%;
    transform: translate(-19%, -31%) rotate(-24deg);
}
.scarlet-inv .orn-ff-1 {
    position: absolute;
    width: 37.94%;
    right: 0;
    bottom: 0;
    transform: translate(29.72%, 20.32%);
}
.scarlet-inv .orn-ff-1-1 {
    position: absolute;
    width: 69.59%;
    right: 75.67%;
    bottom: 0;
    transform: translate(0%, 11.70%);
}
.scarlet-inv .orn-ff-1-1-1 {
    position: absolute;
    width: 28.15%;
    right: 0%;
    top: 0;
    transform: translate(0%, -30.58%);
}
.scarlet-inv .orn-ff-1-1-2 {
    position: absolute;
    width: 76.69%;
    right: 0%;
    top: 0;
    transform: translate(0%, -48.27%) scaleX(-1);
}
.scarlet-inv .orn-ff-1-2 {
    position: absolute;
    width: 65.54%;
    right: 29.72%;
    top: 0;
    transform: translate(0%, -60.68%);
}
.scarlet-inv .orn-ff-1-2-1 {
    position: absolute;
    width: 65.54%;
    right: 0%;
    top: 0;
    transform: translate(50%, -20.28%);
}
.scarlet-inv .orn-ff-1-2-1-1 {
    position: absolute;
    width: 112.9%;
    right: 20.96%;
    top: 0;
    transform: translate(0%, -30.52%) scaleX(1);
}
.scarlet-inv .orn-ff-1-3 {
    position: absolute;
    width: 79.72%;
    left: 0%;
    bottom: 20.33%;
    transform: translate(-53.38%, 0%);
}
.scarlet-inv .orn-ff-2 {
    position: absolute;
    width: 32.30%;
    left: 0;
    bottom: 0;
    transform: translate(-17.46%, 22.77%);
}
.scarlet-inv .orn-ff-2-1 {
    position: absolute;
    width: 55.5%;
    left: 0;
    top: 0;
    transform: translate(3%, -34%);
}
.scarlet-inv .orn-ff-3 {
    position: absolute;
    width: 61.02%;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 21.73%);
}
.scarlet-inv .orn-ff-4 {
    position: absolute;
    width: 24.87%;
    left: 0%;
    bottom: 0;
    transform: translate(0%, -25.93%);
}
.scarlet-inv .orn-ff-4-1 {
    position: absolute;
    width: 103.09%;
    right: 0%;
    bottom: 0;
    transform: translate(55%, 41.55%);
}
.scarlet-inv .orn-ff-4-1-1 {
    position: absolute;
    width: 69%;
    left: 0%;
    bottom: 28.57%;
    transform: translate(5%, 0%);
}
.scarlet-inv .orn-ff-4-2 {
    position: absolute;
    width: 176.28%;
    right: 0%;
    bottom: 0;
    transform: translate(0%, 0%);
}
.scarlet-inv .orn-ff-log1 {
    left: 0%;
    top: 5%;
    transform: translate(-50%);
}
.scarlet-inv .orn-ff-log2 {
    right: 0%;
    bottom: 0%;
    transform: translate(84%);
}
.scarlet-inv .orn-tc-1 {
    position: absolute;
    width: 120%;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    opacity: .5;
}
.scarlet-inv .orn-tc-2 {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
}
.scarlet-inv .orn-tc-3 {
    position: absolute;
    width: 100%;
    bottom: 15%;
    left: 50%;
    transform: translate(-50%, -25%);
}
.scarlet-inv .orn-tc-3-1.right {
    position: absolute;
    width: 50.2%;
    top: 0%;
    right: 0%;
    transform: translate(3%, -16.6%);
}
.scarlet-inv .orn-tc-3-1.left {
    position: absolute;
    width: 50.2%;
    top: 0%;
    left: 0%;
    transform: translate(-3%, -16.6%) scaleX(-1);
}
.scarlet-inv .orn-tc-3-2.right {
    position: absolute;
    width: 79.17%;
    top: 0%;
    right: 0%;
    transform: translate(50%, -43.21%);
}
.scarlet-inv .orn-tc-3-2.left {
    position: absolute;
    width: 79.17%;
    top: 0%;
    left: 0%;
    transform: translate(-50%, -43.21%) scaleX(-1);
}
.scarlet-inv .orn-tc-4.right {
    position: absolute;
    width: 55.64%;
    bottom: 0%;
    right: 0%;
    transform: translate(14.74%, -28.21%) scaleX(-1);
}
.scarlet-inv .orn-tc-4.left {
    position: absolute;
    width: 55.64%;
    bottom: 0%;
    left: 0%;
    transform: translate(-14.74%, -28.21%);
}
@media (min-width: 561px) and (max-width: 960px) {
.scarlet-inv .orn-tc-3 {
        width: 96%;
        transform: translate(-50%, -19%);
    }
.scarlet-inv .orn-tc-4.right, .scarlet-inv .orn-tc-4.left {
        width: 47.64%;
    }
.scarlet-inv .orn-tc-2 {
        transform: translate(-50%, 10%);
    }
}
.scarlet-inv .top-cover .orn-ff-log2 {
    right: 0%;
    bottom: 0%;
    transform: translate(63%, 58%);
}
.scarlet-inv .top-cover .orn-ff-log1 {
    left: 0%;
    top: 16%;
    transform: translate(-77%);
}
.scarlet-inv .primary-pane .orn-tc-4.left, .scarlet-inv .primary-pane .orn-tc-4.right {
    width: 30.64%;
}
.scarlet-inv .primary-pane .orn-ff-4 {
    width: 15.87%;
}
.scarlet-inv .primary-pane .orn-ff-2 {
    width: 19.3%;
}
.scarlet-inv .primary-pane .orn-ff-1 {
    width: 22.94%;
}
.scarlet-inv .primary-pane .orn-ff-3.right {
    position: absolute;
    width: 38.02%;
    left: 30%;
    bottom: 0;
    transform: translate(-50%, 21.73%);
}
.scarlet-inv .primary-pane .orn-ff-3.left {
    position: absolute;
    width: 38.02%;
    right: 30%;
    left: unset;
    bottom: 0;
    transform: translate(50%, 21.73%) scaleX(-1);
}
.scarlet-inv .primary-pane .orn-tc-2 {
    transform: translate(-50%, 45%);
}
.scarlet-inv .primary-pane .orn-tc-3 {
    width: 67%;
    bottom: 15%;
    left: 50%;
    transform: translate(-50%, 9%);
}
.scarlet-inv .orn-pp-1.right {
    position: absolute;
    width: 38.2%;
    bottom: 0%;
    right: 0%;
    transform: translate(3%, -22.6%);
}
.scarlet-inv .orn-pp-1.left {
    position: absolute;
    width: 38.2%;
    bottom: 0%;
    left: 0%;
    transform: translate(-3%, -22.6%) scaleX(-1);
}
.scarlet-inv .orn-pp-2.right {
    position: absolute;
    width: 46.17%;
    bottom: 0%;
    right: 0%;
    transform: translate(50%, -43.21%);
}
.scarlet-inv .orn-pp-2.left {
    position: absolute;
    width: 46.17%;
    bottom: 0%;
    left: 0%;
    transform: translate(-50%, -43.21%) scaleX(-1);
}
@media (max-width: 1024px) {
.scarlet-inv .primary-pane .orn-tc-3 {
        width: 88%;
        bottom: 8%;
        left: 50%;
        transform: translate(-50%, 14%);
    }
.scarlet-inv .orn-tc-1, .scarlet-inv .orn-tc-1 .image-wrap, .scarlet-inv .orn-tc-1 .image-wrap img {
        height: 100%;
    }
}



@keyframes goyang {
    0% {
        transform: rotate(-3deg);
    }

    100% {
        transform: rotate(3deg);
    }
}


@keyframes goyang-slow {
    0% {
        transform: rotate(-2deg);
    }

    100% {
        transform: rotate(2deg);
    }
}


@keyframes float {
    0% {
        transform: scaleX(0.8) translateY(0);
    }

    100% {
        transform: scaleX(1) translateY(-3px);
    }
}


@keyframes float-2 {
    0% {
        transform: scaleX(0.8) translateY(0);
    }

    100% {
        transform: scaleX(1) translateY(-3px);
    }
}


@keyframes fly-diagonal {
    0% {
        opacity: 0;
        transform: translate(250%, 250%) scaleX(1);
    }

    5% {
        opacity: 1;
    }

    10% {
        transform: translate(-225%, 225%) scaleX(0.8);
    }

    20% {
        transform: translate(-200%, 200%) scaleX(1);
    }

    30% {
        transform: translate(-175%, 175%) scaleX(0.8);
    }

    40% {
        transform: translate(-150%, 150%) scaleX(1);
    }

    50% {
        transform: translate(-125%, 125%) scaleX(0.8);
    }

    60% {
        transform: translate(-100%, 100%) scaleX(1);
    }

    70% {
        transform: translate(-75%, 75%) scaleX(0.8);
    }

    80% {
        transform: translate(-50%, 50%) scaleX(1);
    }

    90% {
        transform: translate(-25%, 25%) scaleX(0.8);
    }

    100% {
        transform: translate(-0%, 0%) scaleX(1);
    }
}


@keyframes fly-diagonal-2 {
    0% {
        opacity: 0;
        transform: translate(-250%, 250%) scaleX(1);
    }

    5% {
        opacity: 1;
    }

    10% {
        transform: translate(225%, 225%) scaleX(0.8);
    }

    20% {
        transform: translate(200%, 200%) scaleX(1);
    }

    30% {
        transform: translate(175%, 175%) scaleX(0.8);
    }

    40% {
        transform: translate(150%, 150%) scaleX(1);
    }

    50% {
        transform: translate(125%, 125%) scaleX(0.8);
    }

    60% {
        transform: translate(100%, 100%) scaleX(1);
    }

    70% {
        transform: translate(75%, 75%) scaleX(0.8);
    }

    80% {
        transform: translate(50%, 50%) scaleX(1);
    }

    90% {
        transform: translate(25%, 25%) scaleX(0.8);
    }

    100% {
        transform: translate(0%, 0%) scaleX(1);
    }
}
.scarlet-inv .burung-2 .image-wrap.aos-animate img {
    transform-origin: 50% 50%;
    animation: float-2 1s ease-in-out infinite alternate, fly-diagonal-2 6s linear normal;
}
.scarlet-inv .burung-1 .image-wrap.aos-animate img {
    transform-origin: 50% 50%;
    animation: float 1.5s ease-in-out infinite alternate, fly-diagonal 6s linear normal;
    animation-delay: .9s;
}
.scarlet-inv .orn-cover-12>.image-wrap img {
    transform-origin: 0% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
}
.scarlet-inv .orn-cover-8>.image-wrap img {
    transform-origin: 30% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
    animation-delay: .5s;
}
.scarlet-inv .orn-cover-11>.image-wrap img {
    transform-origin: 60% 100%;
    animation: goyang 6s ease-in-out infinite alternate;
    animation-delay: .7s;
}
.scarlet-inv .orn-cover-6-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
}
.scarlet-inv .orn-couple-edge>.image-wrap img {
    transform-origin: 10% 100%;
    animation: goyang 6s ease-in-out infinite alternate;
}
.scarlet-inv .orn-couple-1-2>.image-wrap img {
    transform-origin: 45% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
    animation-delay: .3s;
}
.scarlet-inv .orn-couple-4>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
}
.scarlet-inv .orn-photo-2-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 3s ease-in-out infinite alternate;
}
.scarlet-inv .orn-photo-4>.image-wrap img, .scarlet-inv .orn-tc-4>.image-wrap img, .scarlet-inv .orn-bank-4>.image-wrap img {
    transform-origin: 9% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
}
.scarlet-inv .orn-lv-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
}
.scarlet-inv .orn-lv-2>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
    animation-delay: .6s;
}
.scarlet-inv .orn-lv-4-1>.image-wrap img {
    transform-origin: 100% 35%;
    animation: goyang 5s ease-in-out infinite alternate;
    animation-delay: .6s;
}
.scarlet-inv .orn-sd-5>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
}
.scarlet-inv .orn-sd-4>.image-wrap img {
    transform-origin: 85% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
}
.scarlet-inv .orn-sd-4-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
    animation-delay: .4s;
}
.scarlet-inv .orn-sd-1-1>.image-wrap img, .scarlet-inv .orn-qt-2-2>.image-wrap img {
    transform-origin: 30% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
    animation-delay: 1.2s;
}
.scarlet-inv .orn-event-1-1-1-1>.image-wrap img, .scarlet-inv .orn-qt-2-1-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
    animation-delay: .4s;
}
.scarlet-inv .orn-event-3-1-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 6s ease-in-out infinite alternate;
    animation-delay: .8s;
}
.scarlet-inv .orn-event-3-1-1-1>.image-wrap img, .scarlet-inv .orn-bank-2-1>.image-wrap img {
    transform-origin: 75% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
    animation-delay: .2s;
}
.scarlet-inv .orn-event-3-1-1-1-1>.image-wrap img {
    transform-origin: 80% 100%;
    animation: goyang 3s ease-in-out infinite alternate;
    animation-delay: .2s;
}
.scarlet-inv .orn-rsvp-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 6s ease-in-out infinite alternate;
}
.scarlet-inv .orn-rsvp-2-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
}
.scarlet-inv .orn-qm-4>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
}
.scarlet-inv .orn-qm-4-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 3s ease-in-out infinite alternate;
}
.scarlet-inv .orn-ff-4-1-1>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 3s ease-in-out infinite alternate;
    animation-delay: .5s;
}
.scarlet-inv .orn-ff-1-1-2>.image-wrap img {
    transform-origin: 50% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
}
.scarlet-inv .orn-ff-1-2-1>.image-wrap img {
    transform-origin: 70% 100%;
    animation: goyang 5s ease-in-out infinite alternate;
}
.scarlet-inv .orn-ff-1-2-1-1>.image-wrap img {
    transform-origin: 80% 100%;
    animation: goyang 4s ease-in-out infinite alternate;
}
.scarlet-inv .invitation-category > .category-icon > svg > path {
    fill: var(--text-primary);
    stroke: var(--text-primary);
}
.scarlet-inv .invitation-category > .category-label {
    color: var(--text-primary);
}
.scarlet-inv .kat-page__side-to-side .primary-pane .inner p.category-label {
    color: var(--text-primary);
}
.scarlet-inv .top-cover-title {
    text-align: center;
}
.scarlet-inv .tct-wrap {
    position: relative;
    margin-top: 10px;
}
.scarlet-inv .tct-wrap::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    width: 150%;
    height: 150%;
    background: radial-gradient(50% 50% at 50% 50%, #E8E1D1 0%, rgba(232, 225, 209, 0.50) 77.4%, rgba(232, 225, 209, 0.00) 100%);
}
.scarlet-inv .invitation-category {
    margin-bottom: 8px;
}

`;
