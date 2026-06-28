<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkforceNeed extends Model
{
    protected $fillable = [
        'school_id',
        'academic_period_id',
        'faculty_needed',
        'vacant_positions',
        'positions_filled',
        'specialization_needed',
        'urgency',
        'notes',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
}