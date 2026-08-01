<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShifteeTransfereeData extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'submitted_by',
        'total_shiftees',
        'shiftees_in',
        'shiftees_out',
        'total_transferees',
        'transferees_in',
        'transferees_out',
        'total_dropouts',
        'status',
        'notes',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
}