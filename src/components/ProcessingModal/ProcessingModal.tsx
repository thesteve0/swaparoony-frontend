import React from 'react';
import {
    Modal,
    ModalBody,
    Spinner,
    Title,
    Flex,
    FlexItem,
} from '@patternfly/react-core';

interface ProcessingModalProps {
    isOpen: boolean;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen }) => {
    return (
        <Modal
            isOpen={isOpen}
            aria-labelledby="processing-modal-title"
            aria-describedby="processing-modal-description"
            variant="medium"
            disableFocusTrap={true}
        >
            <ModalBody>
                <Flex 
                    direction={{ default: 'column' }} 
                    alignItems={{ default: 'alignItemsCenter' }}
                    justifyContent={{ default: 'justifyContentCenter' }}
                    className="pf-v6-u-p-xl"
                >
                    <FlexItem>
                        <Spinner size="xl" className="pf-v6-u-mb-lg" />
                    </FlexItem>
                    <FlexItem>
                        <Title 
                            headingLevel="h2" 
                            size="xl" 
                            id="processing-modal-title"
                            className="pf-v6-u-mb-md"
                        >
                            Processing Your Image
                        </Title>
                    </FlexItem>
                    <FlexItem>
                        <p id="processing-modal-description" className="pf-v6-u-color-200">
                            Please wait while we create your face swap...
                        </p>
                    </FlexItem>
                </Flex>
            </ModalBody>
        </Modal>
    );
};