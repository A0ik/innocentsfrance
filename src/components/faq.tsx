"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQ() {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-8 text-primary">Questions Fréquentes</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Comment obtenir mon reçu fiscal ?</AccordionTrigger>
                        <AccordionContent>
                            Les reçus fiscaux sont envoyés automatiquement par email après chaque don. Vous pouvez également nous contacter si vous ne l'avez pas reçu.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Comment arrêter un prélèvement mensuel ?</AccordionTrigger>
                        <AccordionContent>
                            Vous pouvez gérer vos dons réguliers via le lien reçu dans l'email de confirmation, ou en nous contactant directement via le formulaire.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Comment nous contacter ?</AccordionTrigger>
                        <AccordionContent>
                            Utilisez le formulaire de contact sur la page dédiée ou envoyez-nous un email à contact@innocentsfrance.org.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}
