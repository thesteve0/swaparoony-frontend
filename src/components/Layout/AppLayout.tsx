import React from 'react';
import {
    Page,
    PageSection,
    PageSectionVariants,
    Title,
} from '@patternfly/react-core';
import { CameraIcon } from '@patternfly/react-icons';
import { CameraCapture } from '../Camera';

export const AppLayout: React.FC = () => {
    return (
        <Page>
            {/* Hero Section */}
            <PageSection variant={PageSectionVariants.dark} className="pf-v6-u-text-align-center">
                <Title headingLevel="h1" size="4xl" className="pf-v6-u-mb-md">
                    <CameraIcon style={{ marginRight: '20px' }} />
                    Swaparoony Face Swap Application
                </Title>
                <Title headingLevel="h2" size="lg" className="pf-v6-u-color-200">
                    Transform your photo with AI-powered face swapping
                </Title>
            </PageSection>

            {/* Main Content */}
            <PageSection variant={PageSectionVariants.default}>
                <div className="swaparoony-main-content">
                    <CameraCapture />
                </div>
            </PageSection>
        </Page>
    );
};
